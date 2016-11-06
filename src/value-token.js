// tokens
const VSYM_ARRAY = '...';
const VSYM_EMPTY = '';
const VSYM_NULL = null;
const VSYM_UNDEF = undefined;

/**
 * wrapper object of template value string
 */
export class ValueToken {
  /**
   * constructor
   * @access public
   * @param {string} value - value string of template object
   */
  constructor(value) {
    this._value = value;
  }

  /**
   * string value
   * @access public
   * @return {string} string value
   */
  get value() {
    return (this.isNull || this.isObject) ?
           VSYM_EMPTY :
           this._value;
  }

  /**
   * strip meta tokens and return plain value
   * @access public
   * @return {string} stripped plain value
   */
  get plain() {
    return this.isArrayRest ?
           this._value.slice(VSYM_ARRAY.length) :
           this.value;
  }

  /**
   * resolve meta tokens and return resolved value
   * @access public
   * @param {any} contents - corresponding contents
   * @param {Map<string, function(any):string>} replacers
   * @return {string} resolved value
   */
  resolve(contents, replacers) {
    /* TODO:
    [["id", function(){}]]
    for (const f of replacers) {
      f(contents);
    }
    */
    if (replacers) {
      replacers();
    }
    return this.plain;
  }

  /**
   * check if the value means null
   * @access public
   * @return {boolean} if true, value means null
   */
  get isNull() {
    return this._value === VSYM_EMPTY ||
           this._value === VSYM_UNDEF ||
           this._value === VSYM_NULL;
  }

  /**
   * check if the value is object
   * @access public
   * @return {boolean} if true, value is object
   */
  get isObject() {
    return typeof this._value === 'object';
  }

  /**
   * check if the value has array-rest token
   * @access public
   * @return {boolean} if true, value has array-rest token
   */
  get isArrayRest() {
    return typeof this._value === 'string' &&
           this._value.startsWith(VSYM_ARRAY);
  }

  /**
   * check if the value means something meta
   * @access public
   * @return {boolean} if true, value has meta token
   */
  get isMeta() {
    return this.isNull || this.isArrayRest;
  }
}

export default (value) => new ValueToken(value);
