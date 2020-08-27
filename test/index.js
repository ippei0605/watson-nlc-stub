/**
 * @file テストケース
 * - テスト実行のための前提条件
 *   - 実行する環境において、次の環境変数を設定すること。 (Travis CI には設定済)
 *     - CLOUDANT_CREDS: Cloudant NoSQL DB のサービス資格情報
 *   - Travis CI の場合は、Project の More options の settings で設定する。(JSONは値を'で括る。)
 * - ローカル環境で codecov を実行する場合は、環境変数 CODECOV_TOKEN を設定すること。(Travis CI には設定済)
 */

'use strict';

// モジュールを読込む。
const
  { assert } = require('chai'),
  Cloudant = require('@cloudant/cloudant'),
  fs = require('fs'),
  NaturalLanguageClassifierV1 = require('../index');

// Cloudant サービス資格情報
const creds = JSON.parse(process.env.CLOUDANT_CREDS);

let nlc, errorNlc, forbiddenNlc, firstClassifierId, secondClassifierId, lastClassifierId;

describe('ready', () => {
  it('データベースを削除する', async () => {
    try {
      const cloudant = new Cloudant({
        url: creds.url,
        maxAttempt: 5,
        plugins: [{ iamauth: { iamApiKey: creds.apikey } }, { retry: { retryDelayMultiplier: 4 } }]
      });
      await cloudant.db.destroy('nlc');
    } catch (e) {
      // 削除できなくてもOK
    }
  });
});

describe('constructor', () => {
  it('new 初回', () => {
    nlc = new NaturalLanguageClassifierV1({ apikey: creds.apikey });
    nlc.setServiceUrl(creds.url);
  });
  
  it('new APIキー不正', () => {
    errorNlc = new NaturalLanguageClassifierV1({ apikey: '', url: creds.url });
  });
  
  it('new URL不正', () => {
    forbiddenNlc = new NaturalLanguageClassifierV1({ apikey: creds.apikey });
    forbiddenNlc.setServiceUrl(creds.url + '0');
  });
});

describe('listClassifiers', () => {
  it('classifiers: 0件', async () => {
    try {
      const v = await nlc.listClassifiers({});
      console.log(v);
      assert.deepEqual({ classifiers: [] }, v.result);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  it('Bad Request: Access is denied due to invalid credentials.', async () => {
    try {
      const v = await errorNlc.listClassifiers({});
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal(400, e.code);
    }
  });
  it('Forbidden: Access is denied due to invalid credentials.', async () => {
    try {
      const v = await forbiddenNlc.listClassifiers({});
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal(403, e.code);
    }
  });
});

describe('createClassifier', () => {
  it('Missing required parameters: trainingMetadata', async () => {
    try {
      await nlc.createClassifier({
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      assert.fail();
    } catch (e) {
      console.log('error:', e);
      assert.equal('Missing required parameters: trainingMetadata', e.message);
    }
  });
  
  it('Missing required parameters: trainingData', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Missing required parameters: trainingData', e.message);
    }
  });
  
  it('classifier first', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      firstClassifierId = v.classifier_id;
      assert(v.classifier_id);
      assert(v.url);
      assert(v.name);
      assert(v.language);
      assert(v.created);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  
  it('trainingMetadata 不正', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        }),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      assert.fail(e);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Missing metadata', e.message);
    }
  });
  
  it('trainingData 不正', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.readFileSync(`${__dirname}/classifier.csv`).toString()
      });
      console.log(v);
      assert.fail(e);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Malformed data', e.message);
    }
  });
  
  it('APIキー不正のインスタンス', async () => {
    try {
      const { result: v } = await errorNlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('URL不正のインスタンス', async () => {
    try {
      const { result: v } = await forbiddenNlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Forbidden: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('Data too small: トレーニングデータ 0件', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_0.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Data too small', e.message);
    }
  });
  
  it('Data too small: トレーニングデータ 3件', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_3.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Data too small', e.message);
    }
  });
  
  it('Malformed data: トレーニングデータ 1行目不正', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_phrase_malformed_data_1.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Malformed data', e.message);
    }
  });
  
  it('Phrase too long: トレーニングデータ 4行目不正', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_phrase_too_long_4.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Phrase too long', e.message);
    }
  });
  
  it('Too many classes: トレーニングデータ クラス 3,001件', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_3001.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Too many classes', e.message);
    }
  });
  
  it('Too many data instances: トレーニングデータ 20,001件', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: fs.createReadStream(`${__dirname}/metadata.json`),
        trainingData: fs.createReadStream(`${__dirname}/classifier_20001.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Too many data instances', e.message);
    }
  });
  
  it('classifier 2nd', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.createReadStream(`${__dirname}/classifier_10.csv`)
      });
      console.log(v);
      secondClassifierId = v.classifier_id;
      assert(v.classifier_id);
      assert(v.url);
      assert(v.name);
      assert(v.language);
      assert(v.created);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  
  const createClassifier = async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      assert(v.classifier_id);
      assert(v.url);
      assert(v.name);
      assert(v.language);
      assert(v.created);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  };
  
  it('classifier 3rd', async () => await createClassifier());
  it('classifier 4th', async () => await createClassifier());
  it('classifier 5th', async () => await createClassifier());
  it('classifier 6th', async () => await createClassifier());
  it('classifier 7th', async () => await createClassifier());
  
  it('classifier 8th', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      lastClassifierId = v.classifier_id;
      assert(v.classifier_id);
      assert(v.url);
      assert(v.name);
      assert(v.language);
      assert(v.created);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  
  it('Entitlement error: classifier 9th', async () => {
    try {
      const { result: v } = await nlc.createClassifier({
        trainingMetadata: Buffer.from(JSON.stringify({
          name: 'watson-diet-trainer',
          language: 'ja'
        })),
        trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Entitlement error', e.message);
    }
  });
});

describe('deleteClassifier', () => {
  it('Missing required parameters: classifierId', async () => {
    try {
      const { result: v } = await nlc.deleteClassifier({});
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Missing required parameters: classifierId', e.message);
    }
  });
  
  it('APIキー不正のインスタンス', async () => {
    try {
      const { result: v } = await errorNlc.deleteClassifier({ classifierId: lastClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('URL不正のインスタンス', async () => {
    try {
      const { result: v } = await forbiddenNlc.deleteClassifier({ classifierId: lastClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Forbidden: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('Delete classifier 8th', async () => {
    try {
      const { result: v } = await nlc.deleteClassifier({ classifierId: lastClassifierId });
      console.log(v);
      assert.deepEqual({}, v);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  
  it('Not found', async () => {
    try {
      const { result: v } = await nlc.deleteClassifier({ classifierId: lastClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal(404, e.code);
    }
  });
});

describe('classify', () => {
  it('Missing required parameters: classifierId', async () => {
    try {
      const { result: v } = await nlc.classify({
        text: 'こんにちは'
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Missing required parameters: classifierId', e.message);
    }
  });
  
  it('Missing required parameters: text', async () => {
    try {
      const { result: v } = await nlc.classify({
        classifierId: lastClassifierId
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Missing required parameters: text', e.message);
    }
  });
  
  it('APIキー不正のインスタンス', async () => {
    try {
      const { result: v } = await errorNlc.classify({
        classifierId: firstClassifierId,
        text: 'こんにちは'
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('URL不正のインスタンス', async () => {
    try {
      const { result: v } = await forbiddenNlc.classify({
        classifierId: firstClassifierId,
        text: 'こんにちは'
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Forbidden: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('Not found', async () => {
    try {
      const { result: v } = await nlc.classify({
        classifierId: lastClassifierId,
        text: 'こんにちは'
      });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal(404, e.code);
    }
  });
  
  it('Classifier first', async () => {
    try {
      const { result: v } = await nlc.classify({
        classifierId: firstClassifierId,
        text: 'こんにちは'
      });
      console.log(v);
      assert(v.classifier_id);
      assert(v.text);
      assert(v.top_class);
      assert(v.url);
      assert(v.classes);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
  
  it('Classifier 2nd クラス総数10未満, キーワードアンマッチ', async () => {
    try {
      const { result: v } = await nlc.classify({
        classifierId: secondClassifierId,
        text: 'こんにちは'
      });
      console.log(v);
      assert(v.classifier_id);
      assert(v.text);
      assert(v.top_class);
      assert(v.url);
      assert(v.classes);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
});

describe('getClassifier', () => {
  it('Missing required parameters: classifierId', async () => {
    try {
      const { result: v } = await nlc.getClassifier({});
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      console.log('error:', e);
      assert.equal('Missing required parameters: classifierId', e.message);
    }
  });
  
  it('APIキー不正のインスタンス', async () => {
    try {
      const { result: v } = await errorNlc.getClassifier({ classifierId: firstClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Bad Request: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('URL不正のインスタンス', async () => {
    try {
      const { result: v } = await forbiddenNlc.getClassifier({ classifierId: firstClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal('Forbidden: Access is denied due to invalid credentials.', e.message);
    }
  });
  
  it('Not found', async () => {
    try {
      const { result: v } = await nlc.getClassifier({ classifierId: lastClassifierId });
      console.log(v);
      assert.fail(v);
    } catch (e) {
      console.log('error:', e);
      assert.equal(404, e.code);
    }
  });
  
  it('Classifier first', async () => {
    try {
      const { result: v } = await nlc.getClassifier({ classifierId: firstClassifierId });
      console.log(v);
      assert(v.classifier_id);
      assert(v.name);
      assert(v.language);
      assert(v.created);
      assert(v.url);
      assert(v.status);
      assert(v.status_description);
    } catch (e) {
      console.log('error:', e);
      assert.fail(e);
    }
  });
});
