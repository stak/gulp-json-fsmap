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
    return this.isNull ? VSYM_EMPTY : this._value;
  }

  /**
   * strip special tokens and return plain value
   * @access public
   * @return {string} stripped plain value
   */
  get plain() {
    if (this.isNull) {
      return VSYM_EMPTY;
    } else if (this.isArrayRest) {
      return this._value.slice(VSYM_ARRAY.length);
    } else {
      return this._value;
    }
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
   * check if the value has array-rest token
   * @access public
   * @return {boolean} if true, value has array-rest token
   */
  get isArrayRest() {
    return this._value.startsWith(VSYM_ARRAY);
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
