/**
 * @file Watson Natural Language Classifier Stub
 * @author Ippei SUZUKI
 */

'use strict';

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


/**
 * Cloudant NoSQL DB サービス
 * @typedef {object} cloudant
 * @property {object} db データベース
 */

/**
 * Cloudant NoSQL DB サービス資格情報 + データベース名
 * @typedef {object} creds
 * @property {string} host ホスト名
 * @property {string} password パスワード
 * @property {number} port ポート
 * @property {string} url URL
 * @property {string} username ユーザー名
 * @property {string} dbname データベース名
 */

const initDatabase = (creds) => {
    const cloudant = new Cloudant({
        url: creds.url,
        maxAttempt: 5,
        plugins: {
            retry: {
                retryStatusCodes: [429]
            }
        }
    });
    cloudant.db.get(creds.dbname, (error) => {
        if (error && error.error === 'not_found') {
            cloudant.db.create(creds.dbname, (error) => {
                if (error) {
                    console.log('error:', error);
                } else {
                    const db = cloudant.db.use(creds.dbname);
                    db.insert(designDoc, (error) => {
                        if (error) {
                            console.log('error:', error);
                        }
                    });
                }
            });
        }
    });
    return cloudant.db.use(creds.dbname);
};

const execCallback = (callback, error, value) => {
    if (callback && typeof(callback) === "function") {
        callback(error, value);
    }
};

const checkUnauthorized = (error, callback) => {
    if (error.error === 'unauthorized') {
        execCallback(callback, {
            code: 401,
            error: 'Not Authorized',
        }, null);
    }
};

const checkNotFound = (error, callback) => {
    if (error.error === 'not_found') {
        execCallback(callback, {
            code: 404,
            error: 'Not found',
            description: 'Classifier not found.'
        }, null);
    }
};

const insert = (nlc, name, language, csv, callback) => {
    const
        classes = {},
        line = csv.replace(/\n$/, '').split('\n');
    let
        isError = false,
        count = 0;

    if (line.length > 15000) {
        execCallback(callback, {
            code: 400,
            error: 'Too many data instances',
            description: `The number of training entries received = ${line.length.toLocaleString()}, which is larger than the permitted maximum of 15,000`
        }, null);
    } else if (line.length < 5) {
        execCallback(callback, {
            code: 400,
            error: 'Data too small',
            description: `The number of training entries received = ${line.length}, which is smaller than the required minimum of 5`
        }, null);
    } else {
        line.forEach((row) => {
            count++;
            const item = row.split(',');
            if (!item[0].trim()) {
                isError = true;
                execCallback(callback, {
                    code: 400,
                    error: 'Malformed data',
                    description: `The \'training entry\' value at line ${count.toLocaleString()} and column 1 is \'empty\'.'`
                }, null);
            } else if (item.length === 2) {
                const
                    class_name = item[1].replace(/^["']|["']$/g, ''),
                    question = item[0].replace(/^["']|["']$/g, ''),
                    length = question.length;

                classes[class_name] = classes[class_name] ? classes[class_name] += question : question;

                if (length > 1024) {
                    isError = true;
                    execCallback(callback, {
                        code: 400,
                        error: 'Phrase too long',
                        description: `The phrase at ${count.toLocaleString()} has ${length.toLocaleString()} characters which is larger than the permitted maximum of 1,024 characters.`
                    }, null);
                }
            }
        });

        if (!isError) {
            const
                classifier_id = '??????x???-nlc-?????'.replace(/[?]/g, () => Math.floor(Math.random() * 0xF).toString(16)),
                url = `https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/${classifier_id}`,
                created = moment.utc().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');

            nlc.insert({
                _id: classifier_id,
                type: 'classifier',
                url: url,
                name: name,
                language: language,
                created: created,
                classes: classes
            }, (error) => {
                if (error) {
                    console.log('error:', error);
                }
                execCallback(callback, null, {
                    classifier_id: classifier_id,
                    url: url,
                    name: name,
                    language: language,
                    created: created
                });
            });
        }
    }
};

class NlcStub {
    /**
     * コンストラクター
     * @classdesc Q&A モデル
     * @param creds {creds} Cloudant NoSQL DB のサービス資格情報 + データベース名 (dbname)
     */
    constructor (creds) {
        /**
         * NLC データベース
         */
        this.nlc = initDatabase(creds);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier 一覧を取得する。
     * @param params {object} パラメータ
     * @param callback {listCallback} コールバック
     * @deprecated list() was renamed to listClassifiers(). Support for list() will be removed in the next major release
     */
    list (params, callback) {
        console.warn('WARNING: list() was renamed to listClassifiers(). Support for list() will be removed in the next major release');
        this.listClassifiers(params, callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier 情報を取得する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     * @deprecated status() was renamed to getClassifier(). Support for status() will be removed in the next major release
     */
    status (params, callback) {
        console.warn('WARNING: status() was renamed to getClassifier(). Support for status() will be removed in the next major release');
        this.getClassifier(params, callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier を削除する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     * @deprecated remove() was renamed to deleteClassifier(). Support for remove() will be removed in the next major release
     */
    remove (params, callback) {
        console.warn('WARNING: remove() was renamed to deleteClassifier(). Support for remove() will be removed in the next major release');
        this.deleteClassifier(params, callback);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier を作成する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     * @deprecated create() was renamed to createClassifier(). Support for create() will be removed in the next major release
     */
    create (params, callback) {
        console.warn('WARNING: create() was renamed to createClassifier(). Support for create() will be removed in the next major release');
        // watson-developer-cloud API変更に伴うパラメータ追加
        this.createClassifier(params, callback);
    }

    /**
     * コールバックする。
     * @callback nlcCallback
     * @param {object} error エラー
     * @param {object} value 結果
     */

    /**
     * Classifier 一覧を取得した後にコールバックする。
     * @callback listCallback
     * @param error {object} エラー
     * @param value {object} 結果
     * @property value.classifiers {object[]} Classifier 一覧
     */

    /**
     * Classifier 一覧を取得する。
     * @param params {object} パラメータ
     * @param callback {listCallback} コールバック
     */
    listClassifiers (params, callback) {
        this.nlc.view('classifiers', 'list', (error, value) => {
            if (error) {
                console.log('error:', error);
                checkUnauthorized(error, callback);
            } else {
                const classifiers = value.rows.map(row => row.value);
                execCallback(callback, null, {classifiers: classifiers});
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier 情報を取得する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     */
    getClassifier (params, callback) {
        // パラメータをチェックする。
        if (!params.classifier_id) throw new Error('Missing required parameters: classifier_id');

        // Classifier のステータスを取得する。
        this.nlc.get(params.classifier_id, (error, value) => {
            if (error) {
                console.log('error:', error);
                checkUnauthorized(error, callback);
                checkNotFound(error, callback);
            } else {
                execCallback(callback, null, {
                    classifier_id: value._id,
                    name: value.name,
                    language: value.language,
                    created: value.created,
                    url: value.url,
                    status: 'Available',
                    status_description: 'The classifier instance is now available and is ready to take classifier requests.'
                });
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier を削除する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     */
    deleteClassifier (params, callback) {
        // パラメータをチェックする。
        if (!params.classifier_id) throw new Error('Missing required parameters: classifier_id');

        // Classifier を削除する。
        this.nlc.get(params.classifier_id, (error, value) => {
            if (error) {
                console.log('error:', error);
                checkUnauthorized(error, callback);
                checkNotFound(error, callback);
            } else {
                this.nlc.destroy(value._id, value._rev, () => {
                    execCallback(callback, null, {});
                });
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Classifier を作成する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     */
    createClassifier (params, callback) {
        // パラメータをチェックする。
        if (!params.metadata) throw new Error('Missing required parameters: metadata');
        if (!params.training_data) throw new Error('Missing required parameters: training_data');

        let name, language;
        try {
            // noinspection JSCheckFunctionSignatures
            const metadata = JSON.parse(params.metadata);
            name = metadata.name;
            language = metadata.language;
        } catch (e) {
            throw new Error('Missing metadata');
        }

        // noinspection JSDeprecatedSymbols
        this.listClassifiers({}, (error, value) => {
            if (error) {
                execCallback(callback, error, null);
            } else if (value.classifiers.length < 8) {
                if (typeof params.training_data === 'string') {
                    insert(this.nlc, name, language, params.training_data, callback);
                } else {
                    let csv = '';
                    params.training_data.on('data', (data) => {
                        csv += data;
                    });

                    params.training_data.on('end', () => {
                        insert(this.nlc, name, language, csv, callback);
                    });
                }
            } else {
                execCallback(callback, {
                    code: 400,
                    error: 'Entitlement error',
                    description: 'This user or service instance has the maximum number of classifiers.'
                }, null);
            }
        });
    }

    /**
     * テキストをクラス分類する。
     * @param params {object} パラメータ
     * @param callback {nlcCallback} コールバック
     */
    classify (params, callback) {
        // パラメータをチェックする。
        if (!params.classifier_id) throw new Error('Missing required parameters: classifier_id');
        if (!params.text) throw new Error('Missing required parameters: text');

        this.nlc.get(params.classifier_id, (error, value) => {
            if (error) {
                console.log('error:', error);
                checkUnauthorized(error, callback);
                checkNotFound(error, callback);
            } else {
                const classes = value.classes, temp = [];
                let total = 0, top;
                for (const key in classes) {
                    let confidence = 0;
                    // noinspection JSUnfilteredForInLoop
                    if (~classes[key].indexOf(params.text)) {
                        confidence = 1;
                        total++;
                    }
                    // noinspection JSUnfilteredForInLoop
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
                execCallback(callback, null, {
                    classifier_id: params.classifier_id,
                    url: value.url,
                    text: params.text,
                    top_class: top[0].class_name,
                    classes: top
                });
            }
        });
    }
}

module.exports = NlcStub;
