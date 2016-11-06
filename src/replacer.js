const builtinReplacer = {
  i: (content, path) =>
    path[path.length - 1],
  n: (context, path) =>
    path[path.length - 1],
};

/**
 * resolve meta tokens and return resolved value
 * @access public
 * @param {string} text - specify template string
 * @param {any[]} contexts - specify context to pass replacer function
 * @param {object} replacer - specify replace functions by key-value object
 * @return {string} resolved value
 */
function resolveReplacer(text, contexts, replacer) {
  const mixedReplacer = Object.assign({}, builtinReplacer, replacer);
  const regexStr = `\\$\\{(${Object.keys(mixedReplacer).join('|')})\\}`;
  const re = new RegExp(regexStr, 'g');
  const f = (_, name) => mixedReplacer[name](...contexts);

  return text.replace(re, f);
}

export default resolveReplacer;
