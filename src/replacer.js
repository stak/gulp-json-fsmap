const replacerSymbol = '%';
const builtinReplacer = {
  i: ($) =>
    $.pos[$.pos.length - 1],
  n: ($) =>
    $.pos[$.pos.length - 1] - ($.iterationIndex || 0),
};

/**
 * resolve meta tokens and return resolved value
 * @access public
 * @param {string} text - specify template string
 * @param {object} context - specify context to pass replace function
 * @param {object} replacer - specify replace functions by key-value object
 * @return {string} resolved value
 */
function resolveReplacer(text, context, replacer) {
  if (text.indexOf(replacerSymbol) < 0) {
    return text;
  }
  const mixedReplacer = Object.assign({}, builtinReplacer, replacer);
  const regexStr = `${replacerSymbol}\\{(${Object.keys(mixedReplacer).join('|')})\\}`;
  const re = new RegExp(regexStr, 'g');
  const f = (_, name) => mixedReplacer[name](context);

  return text.replace(re, f);
}

export default resolveReplacer;
