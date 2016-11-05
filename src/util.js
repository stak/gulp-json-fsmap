import gutil from 'gulp-util';
// tokens
const VSYM_SKIP = '';
const KSYM_ALL = '_';

// error
const PLUGIN_NAME = 'gulp-json-fsmap';
const err = (msg) => new gutil.PluginError(PLUGIN_NAME, msg);

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

export default {
  err,
  isSpecialKey,
  isSpecialValue,
};
