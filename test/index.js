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
  chai = require('chai'),
  Cloudant = require('@cloudant/cloudant'),
  fs = require('fs'),
  NaturalLanguageClassifierV1 = require('../index');

// Cloudant サービス資格情報
const creds = JSON.parse(process.env.CLOUDANT_CREDS);

const { assert } = chai;

let nlc, errorNlc, firstClassifierId, secondClassifierId, lastClassifierId;

describe('ready', () => {
  it('データベースを削除する', (done) => {
    const cloudant = new Cloudant(creds.url);
    cloudant.db.destroy(creds.dbname);
    setTimeout(() => {
      done();
    }, 1000);
  });
});

describe('constructor', () => {
  it('new 初回', (done) => {
    nlc = new NaturalLanguageClassifierV1(creds);
    setTimeout(() => {
      done();
    }, 2000);
  });

  it('new 認証エラーが発生するオブジェクト', (done) => {
    const errorCreds = Object.assign({}, creds);
    delete errorCreds.apikey;
    errorCreds.url = errorCreds.url.replace(/https:\/\//g, 'https://xx');
    errorNlc = new NaturalLanguageClassifierV1(errorCreds);
    done();
  });
});

describe('listClassifiers', () => {
  it('classifiers: 0件', (done) => {
    nlc.listClassifiers({})
      .then(v => {
        console.log(v);
        assert.deepEqual({ classifiers: [] }, v);
        done();
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('Not Authorized', (done) => {
    errorNlc.listClassifiers({})
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(401, e.code);
        assert.equal('Not Authorized', e.error);
        done();
      });
  });
});

describe('createClassifier', () => {
  it('Missing required parameters: trainingMetadata', (done) => {
    nlc.createClassifier({
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        console.log(v);
        done(v)
      })
      .catch(e => {
        assert.equal('Missing required parameters: trainingMetadata', e.message);
        done();
      });
  });

  it('Missing trainingMetadata', (done) => {
    nlc.createClassifier({
      trainingMetadata: {
        name: 'watson-diet-trainer',
        language: 'ja'
      },
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        assert.equal('Missing trainingMetadata', e.message);
        done();
      });
  });

  it('Missing required parameters: trainingData', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      })
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        assert.equal('Missing required parameters: trainingData', e.message);
        done();
      });
  });

  it('classifier first', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        console.log(v);
        firstClassifierId = v.classifier_id;
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('Not Authorized, トレーニングデータ: file', (done) => {
    errorNlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(401, e.code);
        assert.equal('Not Authorized', e.error);
        setTimeout(() => {
          done();
        }, 1000);
      });
  });

  it('Data too small, トレーニングデータ: file', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier_3.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(400, e.code);
        assert.equal('Data too small', e.error);
        setTimeout(() => {
          done();
        }, 1000);
      });
  });

  it('Malformed data, トレーニングデータ: string', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.readFileSync(`${__dirname}/classifier_malformed_data_5.csv`).toString()
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(400, e.code);
        assert.equal('Malformed data', e.error);
        done();
      });
  });

  it('Too many data instances, トレーニングデータ: file', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier_15001.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(400, e.code);
        assert.equal('Too many data instances', e.error);
        done();
      });
  });

  it('Phrase too long, トレーニングデータ: file', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier_phrase_too_long_4.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(400, e.code);
        assert.equal('Phrase too long', e.error);
        done();
      });
  });

  it('classifier 2nd', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier_10.csv`)
    })
      .then(v => {
        secondClassifierId = v.classifier_id;
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 3nd', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 4th', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 5th', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 6th', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 7th', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 8th', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        lastClassifierId = v.classifier_id;
        assert(v.classifier_id);
        assert(v.url);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        setTimeout(() => {
          done();
        }, 1000);
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('Entitlement error', (done) => {
    nlc.createClassifier({
      trainingMetadata: JSON.stringify({
        name: 'watson-diet-trainer',
        language: 'ja'
      }),
      trainingData: fs.createReadStream(`${__dirname}/classifier.csv`)
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(400, e.code);
        assert.equal('Entitlement error', e.error);
        done();
      });
  });
});

describe('deleteClassifier', () => {
  it('Missing required parameters: classifierId', (done) => {
    nlc.deleteClassifier({})
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal('Missing required parameters: classifierId', e.message);
        done();
      });
  });

  it('Not Authorized', (done) => {
    errorNlc.deleteClassifier({
      classifierId: lastClassifierId
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(401, e.code);
        assert.equal('Not Authorized', e.error);
        done();
      });
  });

  it('classifiers 8th', (done) => {
    nlc.deleteClassifier({
      classifierId: lastClassifierId
    })
      .then(v => {
        assert.deepEqual({}, v);
        done();
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('Not found', (done) => {
    nlc.deleteClassifier({
      classifierId: lastClassifierId
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(404, e.code);
        assert.equal('Not found', e.error);
        setTimeout(() => {
          done();
        }, 1000);
      });
  });
});

describe('classify', () => {
  it('Missing required parameters: classifierId', (done) => {
    nlc.classify({
      text: 'こんにちは'
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        assert.equal('Missing required parameters: classifierId', e.message);
        done();
      });
  });

  it('Missing required parameters: text', (done) => {
    nlc.classify({
      classifierId: lastClassifierId
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        assert.equal('Missing required parameters: text', e.message);
        done();
      });
  });

  it('Not Authorized', (done) => {
    errorNlc.classify({
      classifierId: firstClassifierId,
      text: 'こんにちは'
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(401, e.code);
        assert.equal('Not Authorized', e.error);
        done();
      });
  });

  it('Not found', (done) => {
    nlc.classify({
      classifierId: lastClassifierId,
      text: 'こんにちは'
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(404, e.code);
        assert.equal('Not found', e.error);
        setTimeout(() => {
          done();
        }, 1000);
      });
  });

  it('classifier first', (done) => {
    nlc.classify({
      classifierId: firstClassifierId,
      text: 'こんにちは'
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.text);
        assert(v.top_class);
        assert(v.url);
        assert(v.classes);
        done();
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });

  it('classifier 2nd クラス総数10未満, キーワードアンマッチ', (done) => {
    nlc.classify({
      classifierId: secondClassifierId,
      text: 'こんにちは'
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.text);
        assert(v.top_class);
        assert(v.url);
        assert(v.classes);
        done();
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });
});

describe('getClassifier', () => {
  it('Missing required parameters: classifier_id', (done) => {
    nlc.getClassifier({})
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal('Missing required parameters: classifierId', e.message);
        done();
      });
  });

  it('Not Authorized', (done) => {
    errorNlc.getClassifier({
      classifierId: firstClassifierId
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(401, e.code);
        assert.equal('Not Authorized', e.error);
        done();
      });
  });

  it('Not found', (done) => {
    nlc.getClassifier({
      classifierId: lastClassifierId
    })
      .then(v => {
        console.log(v);
        done(v);
      })
      .catch(e => {
        console.log('error:', e);
        assert.equal(404, e.code);
        assert.equal('Not found', e.error);
        setTimeout(() => {
          done();
        }, 1000);
      });
  });

  it('classifier first', (done) => {
    nlc.getClassifier({
      classifierId: firstClassifierId
    })
      .then(v => {
        assert(v.classifier_id);
        assert(v.name);
        assert(v.language);
        assert(v.created);
        assert(v.url);
        assert(v.status);
        assert(v.status_description);
        done();
      })
      .catch(e => {
        console.log('error:', e);
        done(e);
      });
  });
});
