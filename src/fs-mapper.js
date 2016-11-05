import {err, isSpecialKey, isSpecialValue} from './util.js';
import traverse from 'traverse';

export default class FsMapper {
  /**
   * construct FsMapper with template object
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
  }

  /**
   * validate template object
   * @access private
   * @param {object|string} template - specify target to validate
   * @return {boolean} if true, template is valid
   */
  _validate(template) {
    const used = {};

    let result = true;
    traverse(template).forEach((x) => {
      const t = typeof x;
      if (t !== 'object' && t !== 'string') {
        result = false;
      }
      if (t === 'string') {
        if (x in used) {
          result = false;   // output file names conflict
        } else if (!isSpecialValue(x)) {
          used[x] = x;
        }
      }
    });

    return result;
  }

  /**
   * match template with src and return mapping definition
   * @access public
   * @param {any} src - specify source object (or primitive value) to map
   * @param {boolean} ignoreUnmatch - specify true to ignore matching error
   * @throws {PluginError} throw gutil.PluginError, expecting to catch and emit error event
   * @return {Map<string, any>} mapping definition (path => value)
   */
  match(src, ignoreUnmatch) {
    const that = this;
    const travSrc = traverse(src);

    /**
     * @this context
     */
    function nodeToFile(v) {
      if (!travSrc.has(this.path)) {
        if (ignoreUnmatch) {
          return null;
        } else if (!isSpecialKey(this.path) && !isSpecialValue(v)) {
          throw err(`Failed to match template (path "${this.path}" is not found)`);
        }
      }
      if (typeof v !== 'string') {
        return null; // nothing to do with Object and Array
      }

      const filePath = v;
      if (isSpecialValue(v)) {
        // TODO: resolve special names
      }

      let target;
      if (isSpecialKey(this.path)) {
        target = that._getUnmapped(travSrc, this.parent.path);
      } else {
        target = travSrc.get(this.path);
      }

      return [filePath, target];
    }

    const keyValues = this.travTemplate.map(nodeToFile)
                                       .nodes()
                                       .filter((a) => Array.isArray(a) &&
                                                      typeof a[0] === 'string');
    return new Map(keyValues);
  }

  /**
   * get the element at specified path, excluding paths map to other file
   * @access private
   * @param {Traverse} travSrc - specify traversed source object to map
   * @param {string[]} parentPath - specify array of string keys from the root to the target node
   * @return {object} the element excluded mapped values
   */
  _getUnmapped(travSrc, parentPath) {
    const parent = travSrc.get(parentPath);
    const copy = Object.assign({}, parent);

    function nextOfParent(p) {
      // parent: ["path", "to", "parent"]
      // p:      ["path", "to", "parent", "next"]
      // => then return "next"
      if (p.length === parentPath.length + 1 &&
          p.every((e, i) => e === parentPath[i] || i === p.length - 1)) {
        return p[p.length - 1];
      } else {
        return null;
      }
    }

    // remove mapped values
    this.travTemplate.paths().map(nextOfParent)
                             .filter((key) => key && !isSpecialKey(key))
                             .forEach((mappedKey) => delete copy[mappedKey]);
    return copy;
  }


}
