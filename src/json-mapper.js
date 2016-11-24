import traverse from 'traverse';
import {err, zip} from './util.js';
import kToken from './key-token';
import vToken from './value-token';

export default class JsonMapper {
  /**
   * construct JsonMapper with template object
   * @param {object|string} template - specify object to define mapping
   * @throws {PluginError} throw gutil.PluginError when parameter is invalid
   */
  constructor(template) {
    // input guards
    if (!template) {
      throw err('Missing template object');
    } else if (!this._validate(template)) {
      throw err('Specified template is invalid');
    }

    this.travTemplate = traverse(template);
    this._makeDictionary();
  }

  /**
   * validate template object
   * @access private
   * @param {object|string} template - specify target to validate
   * @return {boolean} if true, template is valid
   */
  _validate(template) {
    const nodes = traverse(template).nodes();
    const validTypes = ['object', 'string', 'undefined'];

    const isValidType = nodes.map((node) => typeof node)
                             .every((type) => validTypes.indexOf(type) >= 0);
    const differFromNext = (v, i, a) => i === a.length - 1 ||
                                        v !== a[i + 1];
    const isUnique = nodes.filter((node) => typeof node === 'string')
                          .map((str) => vToken(str).plainName)
                          .filter((str) => Boolean(str))
                          .sort()
                          .every(differFromNext);

    return isValidType && isUnique;
  }

  _makeDictionary() {
    // traverse してファイルパスからオブジェクトパスへ変換する Map を作る
    // placeholder 含まれている場合は正規表現をリストにしておいてどうにか
    // さらに、Normal、ObjRest, ArrayRest, ArrayIterate の区分も保存する
    const pairs = zip(this.travTemplate.paths(), this.travTemplate.nodes())
                  .map(([k, v]) => [kToken(k), vToken(v)]);
    const toKeyValue = ([k, v]) => [v.name,
      {
        path: k.path,
        isArraySpread: v.isArraySpread,
        isArrayIterate: v.isArrayIterate,
        isObjectRest: k.isObjectRest,
      },
    ];
    const staticKeyValues = pairs.filter(([, v]) => v.name && !v.isReplacer)
                                 .map(toKeyValue);
    this.staticMap = new Map(staticKeyValues);
    this.dynamicKeyValues = pairs.filter(([, v]) => v.name && v.isReplacer)
                                 .map(toKeyValue);
  }

  match(file, onError) {
    // Plugin の Stream に file が届くたびに呼ばれる
    // 事前に作った辞書と照らしてマッチするか調べ、
    // マッチするなら file.contents をキャプチャしておく
  }

  build(onError) {
    // match で集めた情報をまとめて値にして返す
  }
}
