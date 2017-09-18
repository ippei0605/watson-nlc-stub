# watson-nlc-stub

## はじめに
Watson Natural Language Classifier は自然言語分類してくれる素晴らしいサービスですが、個人使用となりますと高額なサービスだと思います。
* ¥2,100.00 JPY/Classifier per month
* ¥0.3675 JPY/ API call (1000 API calls free per month)
* ¥315.00 JPY/ Training (4 Training Events free per month)

そこで、開発中はなるべく費用がかからないよう、且つ、それなりの動作をするスタブを開発しました。  

### 使い方
```javascript
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

## 


status, classifier, remove
```json
{
 code: 404,
  error: 'Not found',
  description: 'Classifier not found.'
}
```


## list 

なし
```json
{ classifiers: [] }

```

2こ
```json
{ classifiers: 
   [ { classifier_id: '6a25a7x216-nlc-19811',
       url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a25a7x216-nlc-19811',
       name: 'name',
       language: 'ja',
       created: '2017-09-16T14:27:00.544Z' },
     { classifier_id: '6a3354x218-nlc-19668',
       url: 'https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/6a3354x218-nlc-19668',
       name: 'name',
       language: 'ja',
       created: '2017-09-16T14:25:17.255Z' } ] }

```


ユーザーエラー、パスワードエラー
```json
{
  code: 401,
  error: 'Not Authorized',
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

## create
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


```json
{ code: 400,
  error: 'Phrase too long',
  description: 'The phrase at line 1 has 1,025 characters which is larger than the permitted maximum of 1,024 characters.' }

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
