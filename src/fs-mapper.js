import traverse from 'traverse';
import {err, zip} from './util.js';
import kToken from './key-token';
import vToken from './value-token';

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
    const validTypes = ['object', 'string', 'undefined'];

    const isValidType = nodes.map((node) => typeof node)
                             .every((type) => validTypes.indexOf(type) >= 0);
    const isUnique = nodes.filter((node) => typeof node === 'string')
                          .map((str) => vToken(str).plain)
                          .filter((str) => Boolean(str))
                          .sort()
                          .every((str, i, a) => i === a.length - 1 ||
                                                str !== a[i + 1]);
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

    const availableNode = ([pathToken, nodeToken]) => {
      if (!travSrc.has(pathToken.path)) {
        if (ignoreUnmatch) {
          return false;
        } else if (!pathToken.isMeta && !nodeToken.isMeta) {
          throw err(`Failed to match template (path "${pathToken.path}" is not found)`);
        }
      }
      if (!nodeToken.value) {
        return false;
      }
      return true;
    };

    const toFile = ([pathToken, nodeToken]) => {
      const p = pathToken.path;

      let fileContent;
      if (pathToken.isObjectRest) {
        p.pop();
        fileContent = this._getUnmapped(travSrc, p);
      } else if (nodeToken.isArrayRest) {
        const startIndex = p.pop();
        fileContent = travSrc.get(p).slice(startIndex);
      } else {
        fileContent = travSrc.get(p);
      }

      const filePath = nodeToken.resolve(fileContent);
      return [filePath, fileContent];
    };

    const keyValues = zip(this.travTemplate.paths(),
                          this.travTemplate.nodes()).map(([k, v]) => [kToken(k), vToken(v)])
                                                    .filter(availableNode)
                                                    .map(toFile)
                                                    .filter((e) => Boolean(e));
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
                             .filter((key) => key && !kToken(key).isMeta)
                             .forEach((mappedKey) => delete copy[mappedKey]);
    return copy;
  }
}
