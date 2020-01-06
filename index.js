/**
 * @file Watson Natural Language Classifier Stub
 * - 旧バージョンからあった非プロミスのスタブ (index --> nlc-stub) を Promise でラッピングする。
 * @author Ippei SUZUKI
 */

'use strict';

// モジュールを読込む。
const NlcStub = require('./nlc-stub');

class NlcStubPromise {
  /**
   * コンストラクター
   * @param creds {object} サービス認証情報
   */
  constructor (creds) {
    this.nlc = new NlcStub(creds);
  }

  /**
   * テキストをクラス分類する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  classify (params) {
    return doPromise(this.nlc, 'classify', params);
  }

  /**
   * Classifier を作成する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  createClassifier (params) {
    return doPromise(this.nlc, 'createClassifier', params);
  }

  /**
   * Classifier 一覧を取得する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  listClassifiers (params) {
    return doPromise(this.nlc, 'listClassifiers', params);
  }

  /**
   * Classifier 情報を取得する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  getClassifier (params) {
    return doPromise(this.nlc, 'getClassifier', params);
  }

  /**
   * Classifier を削除する。
   * @param params {object} パラメータ
   * @returns {Promise}
   */
  deleteClassifier (params) {
    return doPromise(this.nlc, 'deleteClassifier', params);
  }
}

module.exports = NlcStubPromise;

function doPromise (nlc, method, params) {
  return new Promise((resolve, reject) => {
    try {
      nlc[method](params, (e, v) => {
        if (e) {
          reject(e);
        } else {
          resolve(v);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}