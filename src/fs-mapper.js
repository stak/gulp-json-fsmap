import traverse from 'traverse';
import {err, zip} from './util.js';
import kToken from './key-token';
import vToken from './value-token';
import resolveReplacer from './replacer';

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
    const differFromNext = (v, i, a) => i === a.length - 1 ||
                                        v !== a[i + 1];
    const isUnique = nodes.filter((node) => typeof node === 'string')
                          .map((str) => vToken(str).plainName)
                          .filter((str) => Boolean(str))
                          .sort()
                          .every(differFromNext);

    return isValidType && isUnique;
  }

  /**
   * match template with src and return mapping definition
   * @access public
   * @param {any} src - specify source object (or primitive value) to map
   * @param {object} replacer - specify replace functions by key-value object
   * @param {function(string)} onError - specify onError callback function
   * @throws {PluginError} throw gutil.PluginError, expecting to catch and emit error event
   * @return {Map<string, any>} mapping definition (path => value)
   */
  match(src, replacer, onError) {
    const travSrc = traverse(src);

    const availableNode = ([pathToken, nodeToken]) => {
      if (!travSrc.has(pathToken.path)) {
        if (!pathToken.isMeta && !nodeToken.canSkip) {
          onError(`Failed to match template (json["${pathToken.path.join('"]["')}"] is undefined)`);
          return false;
        }
      }
      if (!nodeToken.value) {
        return false;
      }
      return true;
    };

    const toFile = ([pathToken, nodeToken]) => {
      const p = pathToken.path;
      const sliceParent = (childPath) => {
        const childIndex = childPath.pop();
        const parentArray = travSrc.get(childPath);
        if (!Array.isArray(parentArray)) {
          onError(`Failed to match template (typeof json["${pathToken.path.join('"]["')}"] is not Array)`);
        }

        return [parentArray.slice(childIndex), childIndex];
      };

      if (nodeToken.isArrayIterate) {
        const [sliced, sliceIndex] = sliceParent(p);
        return sliced.map((e, i) => {
          const iteratePath = [...p, parseInt(sliceIndex, 10) + i];
          const fileContent = e;
          const filePath = resolveReplacer(nodeToken.name,
                                           [fileContent, iteratePath],
                                           replacer);
          return [filePath, fileContent];
        });
      } else {
        let fileContent;
        if (pathToken.isObjectRest) {
          p.pop();
          fileContent = this._getUnmapped(travSrc, p);
        } else if (nodeToken.isArraySpread) {
          fileContent = sliceParent(p)[0];
        } else {
          fileContent = travSrc.get(p);
        }

        const filePath = resolveReplacer(nodeToken.name,
                                        [fileContent, pathToken.path],
                                        replacer);
        return [filePath, fileContent];
      }
    };

    const flatten = (prev, next) => prev.concat(Array.isArray(next[0]) ?
                                                next : [next]);

    const keyValues = zip(this.travTemplate.paths(), this.travTemplate.nodes())
                      .map(([k, v]) => [kToken(k), vToken(v)])
                      .filter(availableNode)
                      .map(toFile)
                      .filter((e) => Boolean(e))
                      .reduce(flatten, []);
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
    function nextOfParent(p) {
      // parent: ["path", "to", "parent"]
      // p:      ["path", "to", "parent", "next"]
      // => return "next"
      if (p.length === parentPath.length + 1 &&
          p.every((e, i) =>
            e === parentPath[i] || i === p.length - 1)) {
        return p[p.length - 1];
      } else {
        return null;
      }
    }

    const parent = travSrc.get(parentPath);
    const copy = Object.assign({}, parent);

    // remove mapped values
    this.travTemplate.paths().map(nextOfParent)
                             .filter((key) => key && !kToken(key).isMeta)
                             .forEach((mappedKey) => delete copy[mappedKey]);
    return copy;
  }
}
