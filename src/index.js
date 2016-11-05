import through from 'through2';
import gutil from 'gulp-util';
import path from 'path';
import detectIndent from 'detect-indent';

import FsMapper from './fs-mapper';
import {err} from './util';

// shorthands
const File = gutil.File;
const ext = gutil.replaceExtension;
const PluginError = gutil.PluginError;

/**
 * gulp plugin main function
 * @param {object|string} template - specify template to define mapping
 * @param {string|number} [indent=null] - specify indent style of output json
 * @param {boolean} [mkdir=false] - specify true to make parent directory
 * @param {boolean} [ignoreUnmatch=false] - specify true to ignore error in matching
 * @throws {PluginError} throw PluginError only when called with invalid parameters
 * @return {Transform} stream in object mode to handle vinyl File objects
 */
export default function gulpJsonFsMap(template, {
  indent = null,
  mkdir = false,
  ignoreUnmatch = false,
} = {}) {
  const mapper = new FsMapper(template);

  /**
   * handler for each File
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
      const dirName = mkdir ?
                      ext(path.basename(file.path), '') :
                      '';
      const indentStr = indent !== null ?
                        indent :
                        detectIndent(json).indent; // keep original indent style
      const stringifyWithIndent = (obj) => JSON.stringify(obj, null, indentStr);

      // core logic
      const fsmap = mapper.match(JSON.parse(json), ignoreUnmatch);
      for (const [relPath, v] of fsmap) {
        this.push(new File({
          base: file.base,
          cwd: file.cwd,
          path: path.join(file.base,
                          dirName,
                          ext(relPath, '.json')),
          contents: new Buffer(stringifyWithIndent(v)),
        }));
      }
    } catch (e) {
      // emit exception as an error event
      if (e instanceof PluginError) {
        done(e);
      } else {
        done(err(e));
      }
    }
    return done();
  }

  return through.obj(transform);
}
