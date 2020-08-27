# watson-nlc-stub

[![NPM](https://nodei.co/npm/watson-nlc-stub.png)](https://nodei.co/npm/watson-nlc-stub/)

[![Build Status](https://travis-ci.org/ippei0605/watson-nlc-stub.svg?branch=master)](https://travis-ci.org/ippei0605/watson-nlc-stub)
[![codecov](https://codecov.io/gh/ippei0605/watson-nlc-stub/branch/master/graph/badge.svg)](https://codecov.io/gh/ippei0605/watson-nlc-stub)

## はじめに
Watson Natural Language Classifier は自然言語分類してくれる素晴らしいサービスですが、個人使用となりますと高額なサービスだと思います。
* ¥2,240.00 JPY/Classifier per month
* ¥0.392 JPY/ API call (1,000 API calls free per month)
* ¥336.00 JPY/ Training (4 Training Events free per month)

そこで、開発中はなるべく費用がかからないよう、且つ、それなりの動作をするスタブを開発しました。

## バージョンについて
* 5.0.0 以降は、ibm-watson 5以上のスタブとして動作します。
* 0.0.9 は、ibm-watson 4 または watson-developer-cloud のスタブとして動作します。

### 使い方
```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1({ apikey: creds.apikey });
nlc.setServiceUrl(creds.url);
nlc.listClassifiers({})
  .then(value => {
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

> creds は Cloudant NoSQL DB のサービス資格情報です。

```json
{
  "apikey": "qMNYDzLt4j-UymR1CFN49RaueQ1UuI2SIM-qtEv2VBxL",
  "host": "9fc725e6-32f4-4bed-b138-8c89814e018b-bluemix.cloudantnosqldb.appdomain.cloud",
  "iam_apikey_description": "Auto-generated for key 478d16e2-e626-4d20-8f10-4ad31d4dab45",
  "iam_apikey_name": "Service credentials-1",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/eca1a04b7d8fda242db554b0c976b322::serviceid:ServiceId-a2a0e6d9-873e-47b6-a226-eebf805026ec",
  "url": "https://9fc725e6-32f4-4bed-b138-8c89814e018b-bluemix.cloudantnosqldb.appdomain.cloud",
  "username": "9fc725e6-32f4-4bed-b138-8c89814e018b-bluemix"
}
```

> ibm-watson (本物) は、環境変数 VCAP_SERVICES がある場合はコンストラクターよりそちらの URL を優先するので setServiceUrl を後で実行します。

### システム要件
次のサービスを使用してください。
* IBM Bluemix
    - Cloudant NoSQL DB
        - 制限 (20 Lookups/sec, 10 Writes/sec, 5 Queries/sec) を超えた場合はリトライします。 (500ms 間隔で最大5回実行)
        - Database は `nlc` という名前で作成します。複数の NLC のスタブを実行するには Cloudant も複数使用してください。
* Node.js
    - 8 以上

### インストール
```
$ npm install watson-nlc-stub
```

### 参考情報
* ibm-watson (Watson APIs Node.js SDK)
    - https://www.npmjs.com/package/ibm-watson
* watson-developer-cloud (Watson APIs Node.js SDK)
    - https://www.npmjs.com/package/watson-developer-cloud

---

## API Reference
* [constructor(creds)](#constructorcreds)
* [createClassifier(params)](#createclassifierparams)
* [listClassifiers(params)](#listclassifiersparams)
* [getClassifier(params)](#getclassifierparams)
* [deleteClassifier(params)](#deleteclassifierparams)
* [classify(params)](#classifyparams)

## constructor(creds)
スタブを生成します。ibm-watson の名前に合わせて、次のように生成すると良いと思います。

```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1({ apikey: creds.apikey });
nlc.setServiceUrl(creds.url);
```

[API Reference](#api-reference)

---

## createClassifier(params)
Classifier を作成します。

```javascript
const fs = require('fs');
nlc.createClassifier({
  trainingMetadata: Buffer.from(JSON.stringify({
    name: 'watson-diet-trainer-test',
    language: 'ja'
  })),
  trainingData: fs.createReadStream('classifier.csv')
})
  .then(value => {
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

第1パラメータ params のプロパティを以下に示します。

|Property	      |Type         |Description |
|:----------------|:------------|:-----------|
|trainingMetadata |ReadableStream / Buffer |メタデータ。name と language が必要。未設定時は Error('Missing required parameters: training_data') を、JSONパースできない場合は Error('Missing metadata') をスローします。|
|trainingData     |ReadableStream / Buffer|学習データ。未設定時は Error('Missing required parameters: training_data') をスローします。

実行結果の例を以下に示します。

- 正常ケース
    - value:
    
        ```json
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {
            "classifier_id": "52a07cx8c9-nlc-672aa",
            "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/52a07cx8c9-nlc-672aa",
            "name": "watson-diet-trainer-test",
            "language": "ja",
            "created": "2020-08-26T23:08:17.303Z"
          }
        }
        ```
    > headers は再現が難しいので空のオブジェクトとセットします。
      
- エラーケース: 9個目を createClassifier
    - error: 

        ```json
        {
          "message": "Bad Request: Entitlement error",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"code\":400,\"error\":\"Entitlement error\",\"description\":\"This user or service instance has the maximum number of classifiers.\"}",
          "headers": {}
        }
        ```

- エラーケース: 学習データが5件未満 (以下はデータが3件の結果)
    - error: 

        ```json
        {
          "message": "Bad Request: Data too small",
          "statusText": "Bad Request",
          "code": 400,
          "body": "{\"code\":400,\"error\":\"Data too small\",\"description\":\"The number of training entries received = 3, which is smaller than the required minimum of 5\"}",
          "headers": {}
        }
        ```

- エラーケース: 第1カラム (text) が空 (以下はデータ1行目の第1カラムが空)
    - error:
    
        ```json
        {
          "message": "Bad Request: Malformed data",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"code\":400,\"error\":\"Malformed data\",\"description\":\"The 'text' value at line 1 and column 1 is 'empty'.\"}",
          "headers": {}
        }
        ```

- エラーケース: データが20,000件を超過 (以下はデータが20,010件)
    - error:
    
        ```json
        {
          "message": "Bad Request: Too many data instances",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"code\":400,\"error\":\"Too many data instances\",\"description\":\"The number of training entries received = 20,010, which is larger than the permitted maximum of 20,000\"}",
          "headers": {}
        }
        ```
        
- エラーケース: データの第1カラム (text) が1,024文字を超過 (以下はデータ4行目の第1カラムが1,025文字)
    - error:

        ```json
        {
          "message": "Bad Request: Phrase too long",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"code\":400,\"error\":\"Phrase too long\",\"description\":\"The phrase at 4 has 1,025 characters which is larger than the permitted maximum of 1,024 characters.\"}",
          "headers": {}
        }
        ```

- エラーケース: apikey が間違っている
    - error:
    
        ```json
        {
            "message": "Bad Request: Access is denied due to invalid credentials.",
            "statusText": "Bad Request",
            "status": 400,
            "code": 400,
            "body": "{\"errorCode\":\"BXNIM0415E\",\"errorMessage\":\"Provided API key could not be found\"}",
            "headers": {}
        }
        ```

- エラーケース: url が間違っている
    - error:
    
        ```json
        {
            "message": "Forbidden: Access is denied due to invalid credentials.",
            "statusText": "Forbidden",
            "status": 403,
            "code": 403,
            "body": "{\"code\":403,\"error\":\"Forbidden\"}",
            "headers": {}
        }
        ```

[API Reference](#api-reference)

---

## listClassifiers(params)
Classifier の一覧を取得します。

```javascript
nlc.listClassifiers({})
  .then(value =>{
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

第1パラメータ params は {} を指定してください。

実行結果の例を以下に示します。
- 正常ケース: Classifier が１つも存在しない
    - value:
    
        ```json
        {
            "status": 200,
            "statusText": "OK",
            "headers": {},
            "result": {
                "classifiers": []
            }
        }
        ```

- 正常ケース: Classifier が1つ以上存在する
    - value:
    
        ```json
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {
            "classifiers": [
              {
                "classifier_id": "8999a8xa9a-nlc-888ab",
                "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/8999a8xa9a-nlc-888ab",
                "name": "watson-diet-trainer",
                "language": "ja",
                "created": "2017-09-18T14:50:34.915Z"
              },
              {
                "classifier_id": "ab9a98x8ba-nlc-9b9aa",
                "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/ab9a98x8ba-nlc-9b9aa",
                "name": "watson-diet-trainer-test",
                "language": "ja",
                "created": "2017-09-18T14:51:05.812Z"
              }
            ]
          }
        }
        ```

- エラーケース: apikey が間違っている
    - error:
    
        ```json
        {
          "message": "Bad Request: Access is denied due to invalid credentials.",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"errorCode\":\"BXNIM0415E\",\"errorMessage\":\"Provided API key could not be found\"}",
          "headers": {}
        }
        ```

- エラーケース: url が間違っている
    - error:
    
        ```json
        {
          "message": "Forbidden: Access is denied due to invalid credentials.",
          "statusText": "Forbidden",
          "status": 403,
          "code": 403,
          "body": "{\"code\":403,\"error\":\"Forbidden\"}",
          "headers": {}
        }
        ```

[API Reference](#api-reference)

---

## getClassifier(params)

Classifier 情報を取得します。ステータスは Available (固定値) を返します。

```javascript
nlc.getClassifier({
    classifierId: 'aa989ax8bb-nlc-b8989'
})
  .then(value =>{
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifierId |string       |Classifier ID。未設定時は Error('Missing required parameters: classifierId') をスローします。|

実行結果の例を以下に示します。

- 正常ケース
    - value:
    
        ```json
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {
            "classifier_id": "52a07cx8c9-nlc-672aa",
            "name": "watson-diet-trainer-test",
            "language": "ja",
            "created": "2020-08-26T23:08:17.303Z",
            "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/52a07cx8c9-nlc-672aa",
            "status": "Available",
            "status_description": "The classifier instance is now available and is ready to take classifier requests."
          }
        }
        ```

- エラーケース: apikey が間違っている
    - error:
    
        ```json
        {
          "message": "Bad Request: Access is denied due to invalid credentials.",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"errorCode\":\"BXNIM0415E\",\"errorMessage\":\"Provided API key could not be found\"}",
          "headers": {}
        }
        ```

- エラーケース: url が間違っている
    - error:
    
        ```json
        {
          "message": "Forbidden: Access is denied due to invalid credentials.",
          "statusText": "Forbidden",
          "status": 403,
          "code": 403,
          "body": "{\"code\":403,\"error\":\"Forbidden\"}",
          "headers": {}
        }
        ```
      
- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```json
        {
          "message": "Not Found: Not found",
          "statusText": "Not Found",
          "status": 404,
          "code": 404,
          "body": "{\"code\":404,\"error\":\"Not found\",\"description\":\"Classifier not found.\"}",
          "headers": {}
        }
        ```

[API Reference](#api-reference)

---

## deleteClassifier(params)

Classifier を削除します。

```javascript
nlc.deleteClassifier({
    classifierId: 'aa989ax8bb-nlc-b8989'
})
 .then(value =>{
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifierId |string       |Classifier ID。未設定時は Error('Missing required parameters: classifierId') をスローします。|

実行結果の例を以下に示します。

- 正常ケース

    - value:
    
        ```
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {}
        }
        ```

- エラーケース: apikey が間違っている
    - error:
    
        ```json
        {
          "message": "Bad Request: Access is denied due to invalid credentials.",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"errorCode\":\"BXNIM0415E\",\"errorMessage\":\"Provided API key could not be found\"}",
          "headers": {}
        }
        ```

- エラーケース: url が間違っている
    - error:
    
        ```json
        {
          "message": "Forbidden: Access is denied due to invalid credentials.",
          "statusText": "Forbidden",
          "status": 403,
          "code": 403,
          "body": "{\"code\":403,\"error\":\"Forbidden\"}",
          "headers": {}
        }
        ```
      
- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```json
        {
          "message": "Not Found: Not found",
          "statusText": "Not Found",
          "status": 404,
          "code": 404,
          "body": "{\"code\":404,\"error\":\"Not found\",\"description\":\"Classifier not found.\"}",
          "headers": {}
        }
        ```

[API Reference](#api-reference)

---

## classify(params)
テキストをクラス分類します。

```javascript
nlc.classify({
  classifierId: '85dfc9x224-nlc-2804',
  text: 'こんにちは'
})
  .then(value =>{
    console.log(value);
  })
  .catch(error => {
    console.log('error:', error);
  });
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifierId |string       |Classifier ID。未設定時は Error('Missing required parameters: classifierId') をスローします。|

実行結果の例を以下に示します。

- 正常ケース: クラス総数が10件以上
    - value:
    
        ```
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {
            "classifier_id": "7b065bx5a9-nlc-64092",
            "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/7b065bx5a9-nlc-64092",
            "text": "こんにちは",
            "top_class": "general_hello",
            "classes": [
              {
                "class_name": "general_hello",
                "confidence": 1
              },
              {
                "class_name": "diet_carbocut",
                "confidence": 0
              },
              {
                "class_name": "diet_cereals",
                "confidence": 0
              },
              {
                "class_name": "diet_eatlimit",
                "confidence": 0
              },
              {
                "class_name": "diet_eiyou",
                "confidence": 0
              },
              {
                "class_name": "diet_houhou",
                "confidence": 0
              },
              {
                "class_name": "diet_kogao",
                "confidence": 0
              },
              {
                "class_name": "diet_lowerbody",
                "confidence": 0
              },
              {
                "class_name": "diet_motivation",
                "confidence": 0
              },
              {
                "class_name": "diet_stop",
                "confidence": 0
              }
            ]
          }
        }
        ```

- 正常ケース: クラス総数が10件未満 (以下は2クラス)
    - value:
    
        ```
        {
          "status": 200,
          "statusText": "OK",
          "headers": {},
          "result": {
            "classifier_id": "069749x15e-nlc-6a0ec",
            "url": "https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/069749x15e-nlc-6a0ec",
            "text": "こんにちは",
            "top_class": "diet_carbocut",
            "classes": [
              {
                "class_name": "diet_carbocut",
                "confidence": 0.5
              },
              {
                "class_name": "diet_cereals",
                "confidence": 0.5
              }
            ]
          }
        }
        ```
        
- エラーケース: apikey が間違っている
    - error:
    
        ```json
        {
          "message": "Bad Request: Access is denied due to invalid credentials.",
          "statusText": "Bad Request",
          "status": 400,
          "code": 400,
          "body": "{\"errorCode\":\"BXNIM0415E\",\"errorMessage\":\"Provided API key could not be found\"}",
          "headers": {}
        }
        ```

- エラーケース: url が間違っている
    - error:
    
        ```json
        {
          "message": "Forbidden: Access is denied due to invalid credentials.",
          "statusText": "Forbidden",
          "status": 403,
          "code": 403,
          "body": "{\"code\":403,\"error\":\"Forbidden\"}",
          "headers": {}
        }
        ```
      
- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```json
        {
          "message": "Not Found: Not found",
          "statusText": "Not Found",
          "status": 404,
          "code": 404,
          "body": "{\"code\":404,\"error\":\"Not found\",\"description\":\"Classifier not found.\"}",
          "headers": {}
        }

        ```
      
[API Reference](#api-reference)

---
