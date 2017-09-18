'use strict';

// モジュールを読み込む
const
    fs = require('fs'),
    NaturalLanguageClassifierV1 = require('./index');

// Cloudant NoSQL DB のサービス資格情報 + データベース名 (dbname)
const creds = {
    "dbname": "nlc",
    "username": "a5dec301-509f-466f-9274-5c6b5d2d6ed6-bluemix",
    "password": "8f8c92077fac62b7a629efbe58fb0c0048329e789c4b0372247cda1df822ed6c",
    "host": "a5dec301-509f-466f-9274-5c6b5d2d6ed6-bluemix.cloudant.com",
    "port": 443,
    "url": "https://a5dec301-509f-466f-9274-5c6b5d2d6ed6-bluemix:8f8c92077fac62b7a629efbe58fb0c0048329e789c4b0372247cda1df822ed6c@a5dec301-509f-466f-9274-5c6b5d2d6ed6-bluemix.cloudant.com"
};

// Natural Language Classifier Stub
const nlc = new NaturalLanguageClassifierV1(creds);

nlc.list({}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});


/*
nlc.status({classifier_id: 'aa989ax8bb-nlc-b8989'}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
*/

/*
nlc.remove({classifier_id: '6a3354x218-nlc-23458'}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
*/

/*
nlc.create({
    language: 'ja',
    training_data: fs.createReadStream('classifier_10.csv')
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
*/

/*
nlc.classify({
    classifier_id: 'bba998x99b-nlc-ab888',
    text: '。。。。。。'
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
*/