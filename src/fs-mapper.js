import {err, zip, isSpecialKey, isSpecialValue} from './util.js';
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
    const nodes = traverse(template).nodes();

    const isValidType = nodes.every((node) => typeof node === 'object' ||
                                              typeof node === 'string' ||
                                              typeof node === 'undefined');
    const isUnique = nodes.filter((node) => typeof node === 'string')
                          .sort()
                          .every((str, i, a) => i === a.length - 1 ||
                                                str !== a[i + 1] ||
                                                isSpecialValue(str));
    return isValidType && isUnique;
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
    const travSrc = traverse(src);

    const nodeToFile = ([path, node]) => {
      if (!travSrc.has(path)) {
        if (ignoreUnmatch) {
          return null;
        } else if (!isSpecialKey(path) && !isSpecialValue(node)) {
          throw err(`Failed to match template (path "${path}" is not found)`);
        }
      }
      if (typeof node !== 'string') {
        return null; // nothing to do with Object and Array
      }

      const filePath = node;
      if (isSpecialValue(node)) {
        // TODO: resolve special names
        return null;
      }

      let fileContent;
      if (isSpecialKey(path)) {
        fileContent = this._getUnmapped(travSrc, path.slice(0, -1));
      } else {
        fileContent = travSrc.get(path);
      }

      return [filePath, fileContent];
    };

    const keyValues = zip(this.travTemplate.paths(),
                          this.travTemplate.nodes()).map(nodeToFile)
                                                    .filter((e) => e);
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
