import gutil from 'gulp-util';
const PLUGIN_NAME = 'gulp-json-fsmap';

/**
 * shorthand to make PluginError
 * @param {string} msg - error details
 * @return {PluginError} gulp style Error
 */
function err(msg) {
  return new gutil.PluginError(PLUGIN_NAME, msg);
}

/**
 * zip two arrays
 * @param {any[]} a1 - left array to zip
 * @param {any[]} a2 - right array to zip
 * @return {any[][]} zipped array
 */
function zip(a1, a2) {
  return a1.map((e, i) => [e, a2[i]]);
}

export default {
  err,
  zip,
};
