// tokens
const KSYM_REST = '_';

/**
 * wrapper object of template key string
 */
export class KeyToken {
  /**
   * constructor
   * @access public
   * @param {string|string[]} keyOrPath - key or path array of template object
   */
  constructor(keyOrPath) {
    this._path = Array.isArray(keyOrPath) ? keyOrPath : [keyOrPath];
    this._key = this._path[this._path.length - 1];
  }

  /**
   * get the key
   */
  get key() {
    return this._key;
  }

  /**
   * get the path
   */
  get path() {
    return this._path.slice();
  }

  /**
   * check if the key is rest token
   * @access public
   * @return {boolean} if true, key is rest token
   */
  get isObjectRest() {
    return this._key === KSYM_REST;
  }

  /**
   * check if the key means something meta
   * @access public
   * @return {boolean} if true, key has meta token
   */
  get isMeta() {
    return this.isObjectRest;
  }
}

export default (key) => new KeyToken(key);
