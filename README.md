# watson-nlc-stub

[![NPM](https://nodei.co/npm/watson-nlc-stub.png)](https://nodei.co/npm/watson-nlc-stub/)

## はじめに
Watson Natural Language Classifier は自然言語分類してくれる素晴らしいサービスですが、個人使用となりますと高額なサービスだと思います。
* ¥2,100.00 JPY/Classifier per month
* ¥0.3675 JPY/ API call (1000 API calls free per month)
* ¥315.00 JPY/ Training (4 Training Events free per month)

そこで、開発中はなるべく費用がかからないよう、且つ、それなりの動作をするスタブを開発しました。  

### 使い方
```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1(creds);
nlc.list({}, (error, value) => {
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
* Node.js
    - 6 以上

### インストール
```
$ npm install watson-nlc-stub
```

### 参考情報
* watson-developer-cloud
    - https://www.npmjs.com/package/watson-developer-cloud

---
<a name="table-of-contents"></a>
## 目次
* [APIs](#apis)
    - [constructor(creds)](#constructorcreds)
    - [create(params, [callback])](#createparams-callback)
    - [list(params, [callback])](#listparams-callback)


## APIs

### constructor(creds)
スタブを生成します。watson-developer-cloud の名前に合わせて、次のように生成すると良いと思います。

```javascript
const NaturalLanguageClassifierV1 = require('watson-nlc-stub');
const nlc = new NaturalLanguageClassifierV1(creds);
```

[目次に戻る](#table-of-contents)

---

### create(params, [callback])
Classifier を作成します。

```javascript
nlc.create({
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

パラメータを以下に示します。

|Parameter	  |Type         |Description |
|:------------|:------------|:-----------|
|language     |string       |'ja' などを指定してください。スタブの動作としては意味はありません。ない場合は Error('Missing required parameters: language') をスローします。|
|name         |string       |ない場合は null になります。|
|training_data|file / string|ReadStream をない場合は Error('Missing required parameters: training_data') をスローします。


if (!params.language) throw new ;
        if (!params.training_data) throw new 

実行結果を以下に示します。

```json
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

9個目をcreate しようとするとエラー
````json
{
  code: 400,
  error: 'Entitlement error',
  description: 'This user or service instance has the maximum number of classifiers.'
}
````

データが少ない、５行ならOK
```json
{
  code: 400,
  error: 'Data too small',
  description: 'The number of training entries received = 2, which is smaller than the required minimum of 5' }

```


code: 400,
  error: 'Malformed data',
  description: 'The \'training entry\' value at line 15,000 and column 1 is \'empty\'.' }


本物は watson-developer-cloud は15002 で以下のエラーになります。バグじゃないかな？
スタブは15001でエラーとしています。


 ```json
{
  code: 400,
  error: 'Too many data instances',
  description: 'The number of training entries received = 15,001, which is larger than the permitted maximum of 15,000'
}
```


```json
{ code: 400,
  error: 'Phrase too long',
  description: 'The phrase at line 1 has 1,025 characters which is larger than the permitted maximum of 1,024 characters.' }

```



* サービス資格情報 (url) のユーザー名またはパスワードが間違っている場合
    - エラー (error)
    ```
    { code: 401, error: 'Not Authorized' }
    ```
    - 結果 (value): null

[目次に戻る](#table-of-contents)

---

### list(params, [callback])
Classifier の一覧を取得します。

```javascript
nlc.list({}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```

パラメータを以下に示します。
* なし

実行結果を以下に示します。

* Classifier が１つも存在しない場合
    - エラー (error): null
    - 結果 (value)
    ```
    { classifiers: [] }
    ```
* Classifier が1つ以上存在する場合
    - エラー (error): null
    - 結果 (value)
    ```
    { classifiers:
       [ { classifier_id: '8999a8xa9a-nlc-888ab',
           url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/8999a8xa9a-nlc-888ab',
           name: 'watson-diet-trainer',
           language: 'ja',
           created: '2017-09-18T14:50:34.915Z' },
         { classifier_id: 'ab9a98x8ba-nlc-9b9aa',
           url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/ab9a98x8ba-nlc-9b9aa',
           name: 'watson-diet-trainer-test',
           language: 'ja',
           created: '2017-09-18T14:51:05.812Z' } ] }

    ```

* サービス資格情報 (url) のユーザー名またはパスワードが間違っている場合
    - エラー (error)
    ```
    { code: 401, error: 'Not Authorized' }
    ```
    - 結果 (value): null

[目次に戻る](#table-of-contents)

---

### status(params, [callback])

Classifier 情報を取得する。

```javascript
nlc.status({classifier_id: 'aa989ax8bb-nlc-b8989'}, (error, value) => {
    if (error) {
        console.log('error:', error);
    } else {
        console.log(value);
    }
});
```
実行結果を以下に示します。



[目次に戻る](#table-of-contents)

---



status, classifier, remove
```json
{
 code: 404,
  error: 'Not found',
  description: 'Classifier not found.'
}
```




## status
Availableを返す

```json
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



## remove
```json
{}
```

## classify
```json
{
  classifier_id: '85dfc9x224-nlc-2804',
  url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/85dfc9x224-nlc-2804',
  text: 'こんにちは',
  top_class: 'general_hello',
  classes: [
     { class_name: 'general_hello', confidence: 1 },
     { class_name: 'general_bye', confidence: 0 },
     { class_name: 'general_whoareyou', confidence: 0 },
     { class_name: 'general_thanks', confidence: 0 },
     { class_name: 'diet_stop', confidence: 0 },
     { class_name: 'diet_undou', confidence: 0 },
     { class_name: 'general_howareyou', confidence: 0 },
     { class_name: 'diet_kogao', confidence: 0 },
     { class_name: 'diet_lowerbody', confidence: 0 },
     { class_name: 'diet_eiyou', confidence: 0 }
  ]
}
```

クラスが1つしかない場合は1クラス。最小クラス数、最大10クラスの回答
```json
{ classifier_id: '6a3354x218-nlc-19705',
  url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a3354x218-nlc-19705',
  text: 'こんにちは',
  top_class: 'diet_carbocut',
  classes: [ { class_name: 'diet_carbocut', confidence: 1 } ] }
```
