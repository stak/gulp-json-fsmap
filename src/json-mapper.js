import traverse from 'traverse';
import path from 'path';
import {err, zip} from './util.js';
import kToken from './key-token';
import vToken from './value-token';

export default class JsonMapper {
  /**
   * construct JsonMapper with template object
   * @param {object|string} template - specify object to define mapping
   * @throws {PluginError} throw gutil.PluginError when parameter is invalid
   */
  constructor(template, parser, extension) {
    // input guards
    if (!template) {
      throw err('Missing template object');
    } else if (!this._validate(template)) {
      throw err('Specified template is invalid');
    }

    this.travTemplate = traverse(template);

    this._autoExt = extension;
    this._parser = parser;
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
    const pairs = zip(this.travTemplate.paths(), this.travTemplate.nodes())
                  .map(([k, v]) => [kToken(k), vToken(v)]);
    const toKeyValue = ([k, v]) => [v.name,
      {
        path: k.path,
        isArraySpread: v.isArraySpread,
        isArrayIterate: v.isArrayIterate,
        isObjectRest: k.isObjectRest,
        matched: false,
        contents: null,
      },
    ];
    const staticKeyValues = pairs.filter(([, v]) => v.name && !v.isReplacer)
                                 .map(toKeyValue);
    this._staticMap = new Map(staticKeyValues);
    this._dynamicKeyValues = pairs.filter(([, v]) => v.name && v.isReplacer)
                                  .map(toKeyValue)
                                  .map(([name, obj]) => [this._makeRegex(name), obj]);
  }

  _makeRegex(name) {
    return name; // TODO:
  }

  match(file, onError) {
    // Plugin の Stream に file が届くたびに呼ばれる
    // 事前に作った辞書と照らしてマッチするか調べ、
    // マッチするなら file.contents をキャプチャしておく
    const relativePath = path.relative(file.base, file.path);
    const mapping = this._staticMap.get(relativePath) ||
                    this._staticMap.get(path.basename(relativePath, this._autoExt));
    mapping.matched = true;
    mapping.contents = file.contents;
  }

  build(onError) {
    // match で集めた情報をまとめて値にして返す
  }
}
