'use strict';

// モジュールを読み込む。
const
    fs = require('fs'),
    watson = require('watson-developer-cloud');


const creds = {
    "url": "https://gateway.watsonplatform.net/natural-language-classifier/api",
    "username": "534f1949-209e-4c5a-a4fc-24bb44ffe422",
    "password": "4Ad36gAjpb4x"
};


// Natural Language Classifier
const nlc = new watson.NaturalLanguageClassifierV1(creds);

// https://www.ibm.com/watson/developercloud/natural-language-classifier/api/v1/?node#create_classifier
nlc.create({
    language: 'ja',
    name: 'name',
    training_data: fs.createReadStream('classifier.csv')
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log('value:', value);
    }
});
