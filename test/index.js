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

// Bluemix サービス資格情報
const creds = JSON.parse(process.env.CLOUDANT_CREDS);

const assert = chai.assert;

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

    it('new 認証エラーが発生するオブジェク', (done) => {
        creds.url = creds.url.replace(/https:\/\//g, 'https://xx');
        errorNlc = new NaturalLanguageClassifierV1(creds);
        done();
    });
});

describe('list', () => {
    it('classifiers: 0件', (done) => {
        nlc.list({}, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.deepEqual({classifiers: []}, value);
            assert.equal(null, error);
            done();
        });
    });

    it('Not Authorized', (done) => {
        errorNlc.list({}, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(401, error.code);
            assert.equal('Not Authorized', error.error);
            assert.equal(null, value);
            done();
        });
    });
});

describe('create', () => {
    it('Missing required parameters: metadata', (done) => {
        try {
            nlc.create({
                training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
            });
        } catch (e) {
            assert.equal('Missing required parameters: metadata', e.message);
            done();
        }
    });

    it('Missing metadata', (done) => {
        try {
            nlc.create({
                metadata: {
                    name: 'watson-diet-trainer',
                    language: 'ja'
                },
                training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
            });
        } catch (e) {
            assert.equal('Missing metadata', e.message);
            done();
        }
    });

    it('Missing required parameters: training_data', (done) => {
        try {
            nlc.create({
                metadata: JSON.stringify({
                    name: 'watson-diet-trainer',
                    language: 'ja'
                })
            });
        } catch (e) {
            assert.equal('Missing required parameters: training_data', e.message);
            done();
        }
    });

    it('classifier first', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            firstClassifierId = value.classifier_id;
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('Not Authorized, トレーニングデータ: file', (done) => {
        errorNlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(401, error.code);
            assert.equal('Not Authorized', error.error);
            assert.equal(null, value);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('Data too small, トレーニングデータ: file', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier_3.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(400, error.code);
            assert.equal('Data too small', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('Malformed data, トレーニングデータ: string', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.readFileSync(`${__dirname}/classifier_malformed_data_5.csv`).toString()
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(400, error.code);
            assert.equal('Malformed data', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('Too many data instances, トレーニングデータ: file', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier_15001.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(400, error.code);
            assert.equal('Too many data instances', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('Phrase too long, トレーニングデータ: file', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier_phrase_too_long_4.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(400, error.code);
            assert.equal('Phrase too long', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('classifier 2nd', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier_10.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            secondClassifierId = value.classifier_id;
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 3nd', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 4th', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 5th', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 6th', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 7th', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier 8th', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            lastClassifierId = value.classifier_id;
            assert(value.classifier_id);
            assert(value.url);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            setTimeout(() => {
                done();
            }, 2000);
        });
    });

    it('Entitlement error', (done) => {
        nlc.create({
            metadata: JSON.stringify({
                name: 'watson-diet-trainer',
                language: 'ja'
            }),
            training_data: fs.createReadStream(`${__dirname}/classifier.csv`)
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(400, error.code);
            assert.equal('Entitlement error', error.error);
            assert.equal(null, value);
            done();
        });
    });
});

describe('remove', () => {
    it('Missing required parameters: classifier_id', (done) => {
        try {
            nlc.remove({});
        } catch (e) {
            assert.equal('Missing required parameters: classifier_id', e.message);
            done();
        }
    });

    it('Not Authorized', (done) => {
        errorNlc.remove({
            classifier_id: lastClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(401, error.code);
            assert.equal('Not Authorized', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('classifiers 8th', (done) => {
        nlc.remove({
            classifier_id: lastClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(null, error);
            assert.deepEqual({}, value);
            done();
        });
    });

    it('Not found', (done) => {
        nlc.remove({
            classifier_id: lastClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(404, error.code);
            assert.equal('Not found', error.error);
            assert.equal(null, value);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });
});

describe('classify', () => {
    it('Missing required parameters: classifier_id', (done) => {
        try {
            nlc.classify({
                text: 'こんにちは'
            });
        } catch (e) {
            assert.equal('Missing required parameters: classifier_id', e.message);
            done();
        }
    });

    it('Missing required parameters: text', (done) => {
        try {
            nlc.classify({
                classifier_id: lastClassifierId
            });
        } catch (e) {
            assert.equal('Missing required parameters: text', e.message);
            done();
        }
    });

    it('Not Authorized', (done) => {
        errorNlc.classify({
            classifier_id: firstClassifierId,
            text: 'こんにちは'
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(401, error.code);
            assert.equal('Not Authorized', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('Not found', (done) => {
        nlc.classify({
            classifier_id: lastClassifierId,
            text: 'こんにちは'
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(404, error.code);
            assert.equal('Not found', error.error);
            assert.equal(null, value);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier first', (done) => {
        nlc.classify({
            classifier_id: firstClassifierId,
            text: 'こんにちは'
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(null, error);
            assert(value.classifier_id);
            assert(value.text);
            assert(value.top_class);
            assert(value.url);
            assert(value.classes);
            done();
        });
    });

    it('classifier 2nd クラス総数10未満, キーワードアンマッチ', (done) => {
        nlc.classify({
            classifier_id: secondClassifierId,
            text: 'こんにちは'
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(null, error);
            assert(value.classifier_id);
            assert(value.text);
            assert(value.top_class);
            assert(value.url);
            assert(value.classes);
            done();
        });
    });
});

describe('status', () => {
    it('Missing required parameters: classifier_id', (done) => {
        try {
            nlc.status({});
        } catch (e) {
            assert.equal('Missing required parameters: classifier_id', e.message);
            done();
        }
    });

    it('Not Authorized', (done) => {
        errorNlc.status({
            classifier_id: firstClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(401, error.code);
            assert.equal('Not Authorized', error.error);
            assert.equal(null, value);
            done();
        });
    });

    it('Not found', (done) => {
        nlc.status({
            classifier_id: lastClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(404, error.code);
            assert.equal('Not found', error.error);
            assert.equal(null, value);
            setTimeout(() => {
                done();
            }, 1000);
        });
    });

    it('classifier first', (done) => {
        nlc.status({
            classifier_id: firstClassifierId
        }, (error, value) => {
            if (error) console.log('error:', error);
            console.log(value);
            assert.equal(null, error);
            assert(value.classifier_id);
            assert(value.name);
            assert(value.language);
            assert(value.created);
            assert(value.url);
            assert(value.status);
            assert(value.status_description);
            done();
        });
    });
});