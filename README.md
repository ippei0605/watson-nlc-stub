# watson-nlc-stub

[![NPM](https://nodei.co/npm/watson-nlc-stub.png)](https://nodei.co/npm/watson-nlc-stub/)

[![Build Status](https://travis-ci.org/ippei0605/watson-nlc-stub.svg?branch=master)](https://travis-ci.org/ippei0605/watson-nlc-stub)
[![codecov](https://codecov.io/gh/ippei0605/watson-nlc-stub/branch/master/graph/badge.svg)](https://codecov.io/gh/ippei0605/watson-nlc-stub)

## はじめに
Watson Natural Language Classifier は自然言語分類してくれる素晴らしいサービスですが、個人使用となりますと高額なサービスだと思います。
* ¥2,100.00 JPY/Classifier per month
* ¥0.3675 JPY/ API call (1,000 API calls free per month)
* ¥315.00 JPY/ Training (4 Training Events free per month)

そこで、開発中はなるべく費用がかからないよう、且つ、それなりの動作をするスタブを開発しました。

### 使い方
```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1(creds);
nlc.listClassifiers({}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

> creds は Cloudant NoSQL DB のサービス資格情報にデータベース名 (dbname) を付加した次のようなオブジェクトです。

```javascript
const creds = {
    "dbname": "nlc",
    "username": "a5xxx999-xxxx-xxxx-xxxx-5c6b5d2d6ed6-bluemix",
    "password": "xxxxx2077xxxxxb7a629efbe58fb0c0048329e789c4b0372247cda1df82xxxxx",
    "host": "a5xxx999-xxxx-xxxx-xxxx-5c6b5d2d6ed6-bluemix.cloudant.com",
    "port": 443,
    "url": "https://a5xxx999-xxxx-xxxx-9274-5c6b5d2d6ed6-bluemix:8f8c92077fac62b7a629efbe58fb0c0048329e789c4b0372247cda1df82xxxxx@a5xxx999-xxxx-xxxx-xxxx-5c6b5d2d6ed6-bluemix.cloudant.com"
};
```

### システム要件
次のサービスを使用してください。
* IBM Bluemix
    - Cloudant NoSQL DB
        - 制限 (20 Lookups/sec, 10 Writes/sec, 5 Queries/sec) を超えた場合はリトライします。 (500ms 間隔で最大5回実行)
* Node.js
    - 8 以上

### インストール
```
$ npm install watson-nlc-stub
```

### 参考情報
* watson-developer-cloud (Watson APIs Node.js SDK)
    - https://www.npmjs.com/package/watson-developer-cloud

### 注意
watson-developer-cloud の次回メジャーリリースでメソッドが変更になるようです。現在は両方のメソッドが使用できますが、 Current method では警告が表示されます。

| Current method | New method       |
|:---------------|:-----------------|
| create         | createClassifier |
| list           | listClassifiers  |
| status         | getClassifier    |
| remove         | deleteClassifier |

---

## API Reference
* [constructor(creds)](#constructorcreds)
* [createClassifier(params, [callback])](#createclassifierparams-callback)
* [listClassifiers(params, [callback])](#listclassifiersparams-callback)
* [getClassifier(params, [callback])](#getclassifierparams-callback)
* [deleteClassifier(params, [callback])](#deleteclassifierparams-callback)
* [classify(params, [callback])](#classifyparams-callback)

## constructor(creds)
スタブを生成します。watson-developer-cloud の名前に合わせて、次のように生成すると良いと思います。

```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1(creds);
```

[API Reference](#api-reference)

---

## createClassifier(params, [callback])
Classifier を作成します。

```javascript
nlc.createClassifier({
    language: 'ja',
    name: 'watson-diet-trainer-test',
    training_data: fs.createReadStream('classifier.csv')
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|language     |string       |'ja' などを指定してください。スタブの動作としては意味はありません。未設定時は Error('Missing required parameters: language') をスローします。|
|name         |string       |未設定時は null をセットします。|
|training_data|file / string|学習データ。(file は readStream) 未設定時は Error('Missing required parameters: training_data') をスローします。

実行結果の例を以下に示します。

- 正常ケース
    - error: null
    - value:
    
        ```
        {
          classifier_id: '6a3354x218-nlc-19668',
          name: 'name',
          language: 'ja',
          created: '2017-09-16T14:25:17.255Z',
          url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a3354x218-nlc-19668',
          status: 'Training',
          status_description: 'The classifier instance is in its training phase, not yet ready to accept classify requests'
        }
        ```
- エラーケース: 9個目を createClassifier
    - error: 

        ```
        {
          code: 400,
          error: 'Entitlement error',
          description: 'This user or service instance has the maximum number of classifiers.'
        }
        ```
    - value: null

- エラーケース: 学習データが5件未満 
    - error: 

        ```
        {
          code: 400,
          error: 'Data too small',
          description: 'The number of training entries received = 2, which is smaller than the required minimum of 5'
        }
        ```
    - value: null

- エラーケース: 行頭が空 
    - error:
    
        ```
        {
          code: 400,
          error: 'Malformed data',
          description: 'The \'training entry\' value at line 1 and column 1 is \'empty\'.'
        }
        ```
    - value: null

- エラーケース: 学習データが15,001件以上 (本家 watson-developer-cloud は 15,002件で以下のエラーになります。)
    - error:
    
        ```
        {
          code: 400,
          error: 'Too many data instances',
          description: 'The number of training entries received = 15,001, which is larger than the permitted maximum of 15,000'
        }
        ```
    - value: null
        
- エラーケース: 学習データのテキストに1,025文字以上のデータが1つ以上存在
    - error:

        ```
        {
          code: 400,
          error: 'Phrase too long',
          description: 'The phrase at line 1 has 1,025 characters which is larger than the permitted maximum of 1,024 characters.'
        }
        ```
    - value: null

- エラーケース: サービス資格情報 (url) のユーザー名またはパスワードが間違っている
    - error:

        ```
        {
          code: 401,
          error: 'Not Authorized' 
        }
        ```
    - value: null

[API Reference](#api-reference)

---

## listClassifiers(params, [callback])
Classifier の一覧を取得します。

```javascript
nlc.listClassifiers({}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

第1パラメータ params は {} を指定してください。

実行結果の例を以下に示します。
- 正常ケース: Classifier が１つも存在しない
    - error: null
    - value:
    
        ```
        {
          classifiers: []
        }
        ```

- 正常ケース: Classifier が1つ以上存在する
    - error: null
    - value:
    
        ```
        {
          classifiers: [
            {
              classifier_id: '8999a8xa9a-nlc-888ab',
              url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/8999a8xa9a-nlc-888ab',
              name: 'watson-diet-trainer',
              language: 'ja',
              created: '2017-09-18T14:50:34.915Z'
            },
            {
              classifier_id: 'ab9a98x8ba-nlc-9b9aa',
              url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/ab9a98x8ba-nlc-9b9aa',
              name: 'watson-diet-trainer-test',
              language: 'ja',
              created: '2017-09-18T14:51:05.812Z'
            }
          ]
        }
        ```

- エラーケース: サービス資格情報 (url) のユーザー名またはパスワードが間違っている
    - error:
    
        ```
        {
          code: 401,
          error: 'Not Authorized'
        }
        ```
        
    - value: null

[API Reference](#api-reference)

---

## getClassifier(params, [callback])

Classifier 情報を取得します。ステータスは Available (固定値) を返します。

```javascript
nlc.getClassifier({
    classifier_id: 'aa989ax8bb-nlc-b8989'
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifier_id|string       |Classifier ID。未設定時は Error('Missing required parameters: classifier_id') をスローします。|

実行結果の例を以下に示します。

- 正常ケース
    - error: null
    - value:
    
        ```
        {
          classifier_id: '6a25a7x216-nlc-19811',
          name: 'name',
          language: 'ja',
          created: '2017-09-16T14:27:00.544Z',
          url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a25a7x216-nlc-19811',
          status: 'Available',
          status_description: 'The classifier instance is now available and is ready to take classifier requests.'
        }
        ```

- エラーケース: サービス資格情報 (url) のユーザー名またはパスワードが間違っている
    - error:
    
        ```
        {
          code: 401,
          error: 'Not Authorized'
        }
        ```
        
    - value: null

- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```
        {
          code: 404,
          error: 'Not found',
          description: 'Classifier not found.'
        }
        ```
        
    - value: null

[API Reference](#api-reference)

---

## deleteClassifier(params, [callback])

Classifier を削除します。

```javascript
nlc.deleteClassifier({
    classifier_id: 'aa989ax8bb-nlc-b8989'
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifier_id|string       |Classifier ID。未設定時は Error('Missing required parameters: classifier_id') をスローします。|

実行結果の例を以下に示します。

- 正常ケース
    - error: null
    - value:
    
        ```
        {}
        ```

- エラーケース: サービス資格情報 (url) のユーザー名またはパスワードが間違っている
    - error:
    
        ```
        {
          code: 401,
          error: 'Not Authorized'
        }
        ```
        
    - value: null

- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```
        {
          code: 404,
          error: 'Not found',
          description: 'Classifier not found.'
        }
        ```
        
    - value: null

[API Reference](#api-reference)

---

## classify(params, [callback])
テキストをクラス分類します。

```javascript
nlc.classify({
    classifier_id: '85dfc9x224-nlc-2804',
    text: 'こんにちは'
}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

第1パラメータ params のプロパティを以下に示します。

|Property	  |Type         |Description |
|:------------|:------------|:-----------|
|classifier_id|string       |Classifier ID。未設定時は Error('Missing required parameters: classifier_id') をスローします。|

実行結果の例を以下に示します。

- 正常ケース: クラス総数が10件以上
    - error: null
    - value:
    
        ```
        {
          classifier_id: '85dfc9x224-nlc-2804',
          url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/85dfc9x224-nlc-2804',
          text: 'こんにちは',
          top_class: 'general_hello',
          classes: [
            {
              class_name: 'general_hello',
              confidence: 1
            },
            {
              class_name: 'general_bye',
              confidence: 0
            },
            {
              class_name: 'general_whoareyou',
              confidence: 0
            },
            {
              class_name: 'general_thanks',
              confidence: 0
            },
            {
              class_name: 'diet_stop',
              confidence: 0
            },
            {
              class_name: 'diet_undou',
              confidence: 0
            },
            {
              class_name: 'general_howareyou',
              confidence: 0
            },
            {
              class_name: 'diet_kogao',
              confidence: 0
            },
            {
              class_name: 'diet_lowerbody',
              confidence: 0
            },
            {
              class_name: 'diet_eiyou',
              confidence: 0
            }
          ]
        }
        ```

- 正常ケース: クラス総数が10件未満 (例は1クラス)
    - error: null
    - value:
    
        ```
        {
          classifier_id: '6a3354x218-nlc-19705',
          url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a3354x218-nlc-19705',
          text: 'こんにちは',
          top_class: 'diet_carbocut',
          classes: [
            {
              class_name: 'diet_carbocut',
              confidence: 1
            }
          ]
        }
        ```
        
- エラーケース: サービス資格情報 (url) のユーザー名またはパスワードが間違っている
    - error:
    
        ```
        {
          code: 401,
          error: 'Not Authorized'
        }
        ```
        
    - value: null

- エラーケース: 指定した Classifier が存在しない
    - error:
    
        ```
        {
          code: 404,
          error: 'Not found',
          description: 'Classifier not found.'
        }
        ```
        
    - value: null

[API Reference](#api-reference)

---
