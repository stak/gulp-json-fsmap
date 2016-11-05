import through from 'through2';
import gutil from 'gulp-util';
import path from 'path';
import replaceExt from 'replace-ext';
import traverse from 'traverse';
import detectIndent from 'detect-indent';

// utils
const File = gutil.File;
const PLUGIN_NAME = 'gulp-json-fsmap';
const err = (msg) => new gutil.PluginError(PLUGIN_NAME, msg);

// tokens
const VSYM_SKIP = '';
const KSYM_ALL = '_';

/**
 * check if key string is special token
 * @access private
 * @param {string|string[]} key - key string of template object
 * @return {boolean} if true, key is special
 */
function isSpecialKey(key) {
  const keyArray = Array.isArray(key) ? key : [key];
  const last = keyArray[keyArray.length - 1];

  return last === KSYM_ALL;
}

/**
 * check if value string is special tokenA
 * @access private
 * @param {string} value - value string of template object
 * @return {boolean} if true, value is special
 */
function isSpecialValue(value) {
  return value === VSYM_SKIP;
}

/**
 * validate template object
 * @access private
 * @param {object|string} template - specify target to validate
 * @return {boolean} if true, template is valid
 */
function validateTemplate(template) {
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
 * get the element at specified path, excluding paths map to other file
 * @access private
 * @param {Traverse} travSrc - specify traversed source object to map
 * @param {string[]} parentPath - specify array of string keys from the root to the target node
 * @param {string[][]} paths - specify all paths defined in template
 * @return {object} the element excluded mapped values
 */
function getUnmapped(travSrc, parentPath, paths) {
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
  paths.map(nextOfParent)
       .filter((key) => key && !isSpecialKey(key))
       .forEach((mappedKey) => delete copy[mappedKey]);

  return copy;
}

/**
 * match template with src and return mapping definition
 * @access private
 * @param {Traverse} travTemplate - specify traversd template to define mapping
 * @param {Traverse} travSrc - specify traversed source object to map
 * @throws {PluginError} throw gutil.PluginError, expecting to catch and emit error event
 * @return {Map<string, any>} mapping definition (path => value)
 */
function match(travTemplate, travSrc) {
  const fsmap = new Map();
  const templatePaths = travTemplate.paths();

  /**
   * @this context
   */
  function m(v) {
    if (!travSrc.has(this.path)) {
      if (!isSpecialKey(this.path) && !isSpecialValue(v)) {
        throw err(`Failed to match template (path "${this.path}" is not found)`);
      }
    }
    if (typeof v !== 'string') {
      return; // nothing to do with Object and Array
    }

    const filePath = v;
    if (isSpecialValue(v)) {
      // TODO: resolve special names
    }

    let target;
    if (isSpecialKey(this.path)) {
      target = getUnmapped(travSrc, this.parent.path, templatePaths);
    } else {
      target = travSrc.get(this.path);
    }

    fsmap.set(filePath, target);
  }

  travTemplate.forEach(m);
  return fsmap;
}

/**
 * gulp plugin main function
 * @access public
 * @param {object|string} template - specify template to define mapping
 * @param {?object} options - specify option to configure the plugin
 * @throws {PluginError} throw gutil.PluginError only when called with invalid parameters
 * @return {Transform} stream in object mode to handle vinyl File objects
 */
export default function gulpJsonFsMap(template, options) {
  // input guards
  if (!template) {
    throw err('Missing template object');
  } else if (!validateTemplate(template)) {
    throw err('Specified template is invalid');
  }

  // store traversed template for performance
  const traversedTemplate = traverse(template);

  /**
   * handler for each File
   * @access private
   * @param {File} file - File object to handle
   * @param {string} enc - encoding, but it is ignored if file contains a Buffer
   * @param {function(Error, File)} done - callback function
   * @this Transform
   */
  function transform(file, enc, done) {
    if (file.isNull()) {
      return done(null, file);  // ignore empty file
    } else if (file.isStream()) {
      return done(err('Streaming is not supported'));
    } else if (!file.isBuffer()) {
      return done(err('Unknown Vinyl type'));
    }

    try {
      const json = file.contents.toString('utf8');
      const fsmap = match(traversedTemplate,
                          traverse(JSON.parse(json)));

      for (const [relativePath, v] of fsmap) {
        // TODO: configure f.base and f.cwd with specified option
        this.push(new File({
          base: file.base,
          cwd: file.cwd,
          path: path.join(file.base, replaceExt(relativePath, '.json')),
          contents: new Buffer(JSON.stringify(v)), // TODO: detectIndent
        }));
      }
    } catch (e) {
      // emit exception as an error event
      if (e instanceof gutil.PluginError) {
        done(e);
      } else {
        done(err(e));
      }
    }
    return done();
  }

  return through.obj(transform);
}
