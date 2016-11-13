// tokens
const VSYM_SPREAD = '...';
const VSYM_ITERATE = '*';
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
   * strip meta tokens and return name value
   * @access public
   * @return {string} stripped plain value
   */
  get name() {
    if (this.isArraySpread) {
      return this.value.slice(VSYM_SPREAD.length);
    } else if (this.isArrayIterate) {
      return this.value.slice(VSYM_ITERATE.length);
    } else {
      return this.value;
    }
  }

  /**
   * strip meta tokens and return plain value
   * @access public
   * @return {string} stripped plain value
   */
  get plainName() {
    return this.isReplacer ?
           VSYM_EMPTY :
           this.name;
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
   * check if the value has array spread token
   * @access public
   * @return {boolean} if true, value has array spread token
   */
  get isArraySpread() {
    return typeof this._value === 'string' &&
           this._value.startsWith(VSYM_SPREAD);
  }

  /**
   * check if the value has array iteratation token
   * @access public
   * @return {boolean} if true, value has array iteration token
   */
  get isArrayIterate() {
    return typeof this._value === 'string' &&
           this._value.startsWith(VSYM_ITERATE);
  }

  /**
   * check if the value has replacer token
   * @access public
   * @return {boolean} if true, value has replacer token
   */
  get isReplacer() {
    return typeof this._value === 'string' &&
           (/%\{[a-zA-Z_]+\}/).test(this._value);
  }

  /**
   * check if the value can be skipped safely when match fails
   * @access public
   * @return {boolean} if true, value has meta token
   */
  get canSkip() {
    return this.isNull || this.isArraySpread || this.isArrayIterate;
  }
}

export default (value) => new ValueToken(value);
