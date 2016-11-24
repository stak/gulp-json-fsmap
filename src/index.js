import through from 'through2';
import gutil from 'gulp-util';
import path from 'path';
import detectIndent from 'detect-indent';

import FsMapper from './fs-mapper';
import JsonMapper from './json-mapper';
import resolveReplacer from './replacer';
import {err} from './util';

// shorthands
const File = gutil.File;
const ext = gutil.replaceExtension;
const PluginError = gutil.PluginError;

/**
 * gulp plugin main function
 * @param {object|string} template - specify template to define mapping
 * @param {?string} [extension='json'] - specify extension to add
 * @param {string|number} [indent=null] - specify indent style of output json
 * @param {boolean} [mkdir=false] - specify true to make parent directory
 * @param {boolean} [ignoreUnmatch=false] - specify true to ignore error in matching
 * @param {object} [replacer={}] - specify replace functions by key-value object
 * @throws {PluginError} throw PluginError only when called with invalid parameters
 * @return {Transform} stream in object mode to handle vinyl File objects
 */
function gulpJsonFsSplit(template, {
  extension = 'json',
  indent = null,
  mkdir = false,
  ignoreUnmatch = false,
  replacer = {},
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
      const indentStr = indent !== null ?
                        indent :
                        detectIndent(json).indent; // keep original indent style
      const stringify = (obj) => JSON.stringify(obj, null, indentStr);
      const onError = (msg) => {
        if (!ignoreUnmatch) {
          throw err(msg);
        }
      };

      // core logic
      const fsmap = mapper.match(JSON.parse(json), onError);
      for (const [, context] of fsmap) {
        context.path = file.path;
        const resolvedName = resolveReplacer(context.name, context, replacer);
        const outputDir = mkdir ? ext(path.basename(file.path), '') : '';
        const outputPath = extension ? ext(resolvedName, `.${extension}`) : resolvedName;

        this.push(new File({
          base: file.base,
          cwd: file.cwd,
          path: path.join(file.base, outputDir, outputPath),
          contents: new Buffer(stringify(context.body)),
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

/**
 * gulp plugin main function
 * @param {object|string} template - specify template to define mapping
 * @param {?string} [extension='json'] - specify extension to detect
 * @param {string|number} [indent=null] - specify indent style of output json
 * @param {boolean} [ignoreUnmatch=false] - specify true to ignore error in matching
 * @param {object} [parser={}] - specify placeholder parser functions by key-value object
 * @throws {PluginError} throw PluginError only when called with invalid parameters
 * @return {Transform} stream in object mode to handle vinyl File objects
 */
function gulpJsonFsJoin(template, {
  extension = 'json',
  indent = null,
  ignoreUnmatch = false,
  parser = {},
} = {}) {
  const mapper = new JsonMapper(template);

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
      const onError = (msg) => {
        if (!ignoreUnmatch) {
          throw err(msg);
        }
      };

      // core logic
      mapper.match(file, onError);
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

  /**
   * handler to flush current stream
   * @param {function(Error, File)} done - callback function
   * @this Transform
   */
  function flush(done) {
    const result = mapper.build((msg) => {
      done(err(msg)); // onError
    });

    this.push(new File({
      path: '',
      contents: new Buffer(stringify(result)),
    }));
    done();
  }

  return through.obj(transform, flush);
}

export default {
  split: gulpJsonFsSplit,
  join: gulpJsonFsJoin,
};
