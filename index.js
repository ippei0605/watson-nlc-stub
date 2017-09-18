/**
 * Watson Natural Language Classifier Stub
 * @module index
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const
    fs = require('fs'),
    moment = require('moment'),
    Cloudant = require('cloudant');

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

const initDatabase = (creds) => {
    const cloudant = new Cloudant(creds.url);
    cloudant.db.get(creds.dbname, (error, value) => {
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

class Stub {
    constructor (creds) {
        this.nlc = initDatabase(creds);
    }

    list (params, callback) {
        // Classifier 一覧を取得する。
        this.nlc.view('classifiers', 'list', (error, value) => {
            if (error) {
                console.log('error:', error);
                checkUnauthorized(error, callback);
            } else {
                const classifiers = value.rows.map((row) => {
                    return row.value;
                });
                execCallback(callback, null, {classifiers: classifiers});
            }
        });
    }

    status (params, callback) {
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

    remove (params, callback) {
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

    create (params, callback) {
        // パラメータをチェックする。
        if (!params.language) throw new Error('Missing required parameters: language');
        if (!params.training_data) throw new Error('Missing required parameters: training_data');
        const name = params.name ? params.name : null;

        this.list({}, (error, value) => {
            if (value.classifiers.length < 8) {
                const classifier_id = '??????x???-nlc-?????'.replace(/[?]/g, (c) => {
                    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                const url = `https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/${classifier_id}`;

                let csv = '';
                params.training_data.on('data', (data) => {
                    csv += data;
                });

                params.training_data.on('end', () => {
                    const classes = {};
                    let count = 0;
                    csv.split('\n').forEach((row) => {
                        const item = row.split(',');
                        if (item.length === 2) {
                            const class_name = item[1].replace(/^["']|["']$/g, '');
                            const question = item[0].replace(/^["']|["']$/g, '');
                            classes[class_name] = classes[class_name] ? classes[class_name] += question : question;
                            count++;
                        }
                    });

                    if (count >= 5) {
                        const created = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

                        this.nlc.insert({
                            _id: classifier_id,
                            type: 'classifier',
                            url: url,
                            name: name,
                            language: params.language,
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
                                language: params.language,
                                created: created
                            });
                        });
                    } else {
                        execCallback(callback, {
                            code: 400,
                            error: 'Data too small',
                            description: `The number of training entries received = ${count}, which is smaller than the required minimum of 5`
                        }, null);
                    }
                });
            } else {
                execCallback(callback, {
                    code: 400,
                    error: 'Entitlement error',
                    description: 'This user or service instance has the maximum number of classifiers.'
                }, null);
            }
        });
    }

}

module.exports = Stub;
