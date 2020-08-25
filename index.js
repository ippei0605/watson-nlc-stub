/**
 * @file Watson Natural Language Classifier Stub
 * @author Ippei SUZUKI
 */

'use strict';

// データベース名
const DB_NAME = 'nlc';

// モジュールを読込む。
const
  Cloudant = require('@cloudant/cloudant'),
  moment = require('moment');

// マップ定義: Classifier 一覧を取得
const map = `function (doc) {
  if(doc.type === 'classifier') {
    var row = {
      "classifier_id": doc._id,
      "url": doc.url,
      "name": doc.name,
      "language": doc.language,
      "created": doc.created
    };
    emit(doc._id, row);
  }
}`;

// 設計文書
const designDoc = {
  "_id": "_design/classifiers",
  "views": {
    "list": {
      "map": map
    }
  },
  "language": "javascript"
};

class NlcStub {
  /**
   * コンストラクター
   * @param creds {object} サービス認証情報
   */
  constructor (creds) {
    this.apikey = creds.apikey;
    this.url = creds.url;
  }
  
  /**
   * URLをセットする。
   * @param url {string} URL
   */
  setServiceUrl (url) {
    this.url = url;
  }
  
  /**
   * テキストをクラス分類する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  async classify (params) {
    // パラメータをチェックする。
    if (!params.classifierId) throw new Error('Missing required parameters: classifierId');
    if (!params.text) throw new Error('Missing required parameters: text');
    
    // クラス分類する。
    try {
      const
        db = await getDb(this.apikey, this.url),
        value = await db.get(params.classifierId);
      const classes = value.classes, temp = [];
      let total = 0, top;
      for (const key in classes) {
        let confidence = 0;
        if (~classes[key].indexOf(params.text)) {
          confidence = 1;
          total++;
        }
        temp.push({
          class_name: key,
          confidence: confidence
        });
      }
      temp.sort((a, b) => {
        if (a.confidence > b.confidence) return -1;
        if (a.confidence < b.confidence) return 1;
        return 0;
      });
      if (temp.length > 10) {
        top = temp.slice(0, 10);
      } else {
        top = temp;
      }
      const length = top.length;
      top.forEach((item) => {
        if (total === 0) {
          item.confidence = 1 / length;
        } else {
          item.confidence = item.confidence / total;
        }
      });
      return {
        status: 200, statusText: 'OK', headers: {}, result: {
          classifier_id: params.classifierId,
          url: value.url,
          text: params.text,
          top_class: top[0].class_name,
          classes: top
        }
      };
    } catch (e) {
      notFoundError(e);
      authError(e);
    }
  }
  
  /**
   * Classifier を作成する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  async createClassifier (params) {
    // パラメータをチェックする。
    if (!params.trainingMetadata) throw new Error('Missing required parameters: trainingMetadata');
    if (!params.trainingData) throw new Error('Missing required parameters: trainingData');
    
    // メタデータを取得する。
    let name, language;
    try {
      const
        text = await getTextFromBufferOrStream(params.trainingMetadata),
        metadata = JSON.parse(text);
      name = metadata.name;
      language = metadata.language;
    } catch (e) {
      const error = new Error('Bad Request: Missing metadata');
      throw Object.assign(error, {
        statusText: 'Bad Request',
        status: 400,
        code: 400,
        body: '{"code":400,"error":"Missing metadata","description":"The required training metadata is missing. The request should contain \'language\' and \'name\' besides the training data."}',
        headers: {}
      });
    }
    
    // データを取得する。
    let csv;
    try {
      csv = await getTextFromBufferOrStream(params.trainingData);
    } catch (e) {
      const error = new Error('Bad Request: Malformed data');
      throw Object.assign(error, {
        statusText: 'Bad Request',
        status: 400,
        code: 400,
        body: '{"code":400,"error":"Malformed data","description":"One or more fields in the training data at line 1"}',
        headers: {}
      });
    }
    
    const { result } = await this.listClassifiers({});
    if (result.classifiers.length < 8) {
      const value = await insert(this.apikey, this.url, name, language, csv);
      return value;
    } else {
      const error = new Error('Bad Request: Entitlement error');
      throw Object.assign(error, {
        statusText: 'Bad Request',
        status: 400,
        code: 400,
        body: '{"code":400,"error":"Entitlement error","description":"This user or service instance has the maximum number of classifiers."}',
        headers: {}
      });
    }
  }
  
  /**
   * Classifier 一覧を取得する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  async listClassifiers (params) {
    try {
      const
        db = await getDb(this.apikey, this.url),
        value = await db.view('classifiers', 'list'),
        classifiers = value.rows.map(row => row.value);
      return { status: 200, statusText: 'OK', headers: {}, result: { classifiers } };
    } catch (e) {
      authError(e);
    }
  }
  
  /**
   * Classifier 情報を取得する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  async getClassifier (params) {
    // パラメータをチェックする。
    if (!params.classifierId) throw new Error('Missing required parameters: classifierId');
    
    // Classifier のステータスを取得する。
    try {
      const
        db = await getDb(this.apikey, this.url),
        value = await db.get(params.classifierId),
        result = {
          classifier_id: value._id,
          name: value.name,
          language: value.language,
          created: value.created,
          url: value.url,
          status: 'Available',
          status_description: 'The classifier instance is now available and is ready to take classifier requests.'
        };
      return { status: 200, statusText: 'OK', headers: {}, result };
    } catch (e) {
      notFoundError(e);
      authError(e);
    }
  }
  
  /**
   * Classifier を削除する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  async deleteClassifier (params) {
    // パラメータをチェックする。
    if (!params.classifierId) throw new Error('Missing required parameters: classifierId');
    
    // Classifier を削除する。
    try {
      const
        db = await getDb(this.apikey, this.url),
        { _id, _rev, } = await db.get(params.classifierId);
      await db.destroy(_id, _rev);
      return { status: 200, statusText: 'OK', headers: {}, result: {} };
    } catch (e) {
      notFoundError(e);
      authError(e);
    }
  }
}

module.exports = NlcStub;

// データベースを取得する。データベースがない場合は作成する。
async function getDb (apikey, url) {
  const cloudant = new Cloudant({
    url,
    maxAttempt: 5,
    plugins: [{ iamauth: { iamApiKey: apikey } }, { retry: { retryDelayMultiplier: 4 } }]
  });
  let db;
  try {
    await cloudant.db.get(DB_NAME);
    db = cloudant.db.use(DB_NAME);
  } catch (e) {
    if (e.response && e.response.statusCode === 400) throw { statusCode: 400 };
    if (e.error === 'not_found') {
      try {
        await cloudant.db.create(DB_NAME);
        db = cloudant.db.use(DB_NAME);
        await db.insert(designDoc);
      } catch (e2) {
        // 処理なし
      }
    }
  }
  return db;
}

function authError (e) {
  if (e.statusCode === 400) {
    const error = new Error('Bad Request: Access is denied due to invalid credentials.');
    throw Object.assign(error, {
      statusText: 'Bad Request',
      status: 400,
      code: 400,
      body: '{"errorCode":"BXNIM0415E","errorMessage":"Provided API key could not be found"}',
      headers: {}
    });
  } else {
    const error = new Error('Forbidden: Access is denied due to invalid credentials.');
    throw Object.assign(error, {
      statusText: 'Forbidden',
      status: 403,
      code: 403,
      body: '{"code":403,"error":"Forbidden"}',
      headers: {}
    });
  }
}

function notFoundError (e) {
  if (e.statusCode === 404) {
    const error = new Error('Not Found: Not found');
    throw Object.assign(error, {
      statusText: 'Not Found',
      status: 404,
      code: 404,
      body: '{"code":404,"error":"Not found","description":"Classifier not found."}',
      headers: {}
    });
  }
}

function getTextFromBufferOrStream (item) {
  return new Promise((resolve, reject) => {
    try {
      let text = '';
      if (Buffer.isBuffer(item)) {
        text = item.toString();
        resolve(text);
      } else {
        item.on('data', (data) => {
          text += data;
        });
        item.on('end', () => {
          resolve(text);
        });
      }
    } catch (e) {
      throw e;
    }
  });
}

async function insert (apikey, serviceUrl, name, language, csv) {
  const
    classes = {},
    line = csv.split('\n').filter(v => v);
  let
    isError = false,
    count = 0;
  
  if (line.length > 20000) {
    const error = new Error('Bad Request: Too many data instances');
    throw Object.assign(error, {
      statusText: 'Bad Request',
      status: 400,
      code: 400,
      body: JSON.stringify({
        code: 400,
        error: 'Too many data instances',
        description: `The number of training entries received = ${line.length.toLocaleString()}, which is larger than the permitted maximum of 20,000`
      }),
      headers: {}
    });
  } else if (line.length < 5) {
    const error = new Error('Bad Request: Data too small');
    throw Object.assign(error, {
      statusText: 'Bad Request',
      status: 400,
      code: 400,
      body: JSON.stringify({
        code: 400,
        error: 'Data too small',
        description: `The number of training entries received = ${line.length}, which is smaller than the required minimum of 5`
      }),
      headers: {}
    });
  } else {
    line.forEach((row) => {
      count++;
      const item = row.split(',');
      if (!item[0].trim()) {
        isError = true;
        const error = new Error('Bad Request: Malformed data');
        throw Object.assign(error, {
          statusText: 'Bad Request',
          status: 400,
          code: 400,
          body: `{"code":400,"error":"Malformed data","description":"The 'text' value at line 1 and column 1 is 'empty'."}`,
          headers: {}
        });
      } else if (item.length === 2) {
        const
          class_name = item[1].replace(/^["']|["']$/g, ''),
          question = item[0].replace(/^["']|["']$/g, ''),
          length = question.length;
        
        classes[class_name] = classes[class_name] ? classes[class_name] += question : question;
        
        if (length > 1024) {
          const error = new Error('Bad Request: Phrase too long');
          throw Object.assign(error, {
            statusText: 'Bad Request',
            status: 400,
            code: 400,
            body: JSON.stringify({
              code: 400,
              error: 'Phrase too long',
              description: `The phrase at ${count.toLocaleString()} has ${length.toLocaleString()} characters which is larger than the permitted maximum of 1,024 characters.`
            }),
            headers: {}
          });
        }
      }
    });
    
    if (Object.keys(classes).length > 3000) {
      const error = new Error('Bad Request: Too many classes');
      throw Object.assign(error, {
        statusText: 'Bad Request',
        status: 400,
        code: 400,
        body: JSON.stringify({
          code: 400,
          error: 'Too many classes',
          description: `The training data has ${Object.keys(classes).length.toLocaleString()} classes which is larger than the permitted maximum of 3,000 classes. `
        }),
        headers: {}
      });
    }
    
    if (!isError) {
      const
        classifierId = '??????x???-nlc-?????'.replace(/[?]/g, () => Math.floor(Math.random() * 0xF).toString(16)),
        url = `https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/${classifierId}`,
        created = moment.utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      
      try {
        const db = await getDb(apikey, serviceUrl);
        await db.insert({
          _id: classifierId,
          type: 'classifier',
          url: url,
          name: name,
          language: language,
          created: created,
          classes: classes
        });
        const result = {
          classifier_id: classifierId,
          url: url,
          name: name,
          language: language,
          created: created
        };
        return { status: 200, statusText: 'OK', headers: {}, result };
      } catch (e) {
        authError(e);
      }
    }
  }
}
