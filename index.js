/**
 * Sets value at given namespace path
 * @private
 */
function _set_descendant_path(o, path, value) {
  if (!path) {
    return Object.keys(value).forEach((key) => o[key] = value[key]);
  }

  let keys = path && path.split('.');
  while (keys && keys.length > 1) {
    o = o[keys.shift()];
  }
  o[keys[0]] = value;
}

/**
 * Gets value at given namespace path
 * @private
 */
function _get_descendant_path(o, path) {
  let keys = path && path.split('.');
  while (keys && keys.length) {
    o = o[keys.shift()];
  }
  return o;
}

/**
 * Clone JS object
 * @private
 */
function _clone(data) {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Checks if two objects are different
 * @private
 */
function _has_diff(d1, d2) {
  // todo: optimize
  let v1 = JSON.stringify(d1),
    v2 = JSON.stringify(d2);
  return (v1 !== v2);
}

/**
 * Detects match for namespace in namespaces array
 * namespace `range.start.time` is matched on namespaces `[range]`
 * @private
 */
function _detect_match(namespaces, namespace) {
  if (namespace === undefined) return true;

  if (namespaces.includes(namespace)) return true;

  for (let i = 0, l = namespaces.length; i < l; i++) {
    let ns = namespaces[i];
    // check undefined case
    if (ns === undefined) continue;

    let ns_arr = ns.split('.'),
      ls_arr = namespace.split('.');

    // impossible condition to match
    if (ls_arr.length >= ns_arr.length) continue;

    while(ns_arr.pop() === ls_arr.pop()) {
      // do nothing
    }
    if (ls_arr.length === 0) return true;
  }

  return false;
}

/**
 * Class to convert JS object to observable
 * @class
 */
class State {
  /**
   * @constructor
   * @param {Object} - input object
   */
  constructor(data) {
    this._data = data;
    this._listeners = [];

    // vars used when lock is on
    this._lock = false;
    this._old_data = undefined;
    this._changed_namespaces = [];
  }

  /**
   * Initial call to create instance
   *
   * @param {Object} payload - input object
   * @return {State} instance of the State Class
   */
  static create(data) {
    return new this(data);
  }

  /**
   * Execute listener functions
   * @private
   */
  _notify(namespace) {
    let namespaces = _clone(this._changed_namespaces); namespaces.push(namespace);

    this._listeners.forEach((listener) => {
      // continue if namespaces doesn't match
      if ( !_detect_match(namespaces, listener.namespace) ) return;

      let old_val = _get_descendant_path(this._old_data, listener.namespace),
        new_val = _get_descendant_path(this._data, listener.namespace);

      if ( !_has_diff(old_val, new_val) ) return;

      listener.fn(old_val, new_val);
    });
  }

  /**
   * Returns function to remove listeners
   * @private
   */
  _off(index) {
    let listeners = this._listeners;
    return function() {
      listeners.splice(index, 1);
    }
  }
}

/**
 * Attaches listener function on given namespace path
 *
 * @param {string=} namespace - path on which the listener is to be attached
 * @param {Function} listener - function that will execute upon change detected at namespace
 * @return {Function} function to remove listener
 */
State.prototype.on = function() {
  let args = [...arguments],
    fn = args.pop(), namespace = args.pop();
  this._listeners.push({fn, namespace});
  return this._off(this._listeners.length - 1);
};

/**
 * Appends sub-object at given namespace path
 *
 * @param {string=} namespace - path where object is to be appended
 * @param {Object} payload - actual object to be appended
 */
State.prototype.create = function() {
  if (this._lock) return; // don't proceed if lock is enabled

  let args = [...arguments],
    payload = args.pop(), namespace = args.pop();

  this._old_data = _clone(this._data);
  _set_descendant_path(this._data, namespace, payload);
  this._notify(namespace);
};

/**
 * Returns current value of object in the State instance
 *
 * @return {State} current value of object in State instance
 */
State.prototype.getState = function () {
  return this._data;
};

/**
 * Fetches or updates value at given namespace
 *
 * @param {string} namespace - path where value is to be fetched or updated
 * @param {(Object|string|number|boolean)=} value - actual value to be updated
 * @return {Object|string|number|boolean} value at given namespace
 */
State.prototype.prop = function () {
  let args = [...arguments],
    namespace = args.shift(), value = args.shift();

  if (arguments.length === 2) {
    if (this._lock) {
      _set_descendant_path(this._data, namespace, value);
      this._changed_namespaces.push(namespace); // log namespaces touched
      return this; // enable chaining
    }

    this._old_data = _clone(this._data); // update _old_data when lock is false
    _set_descendant_path(this._data, namespace, value);
    this._notify(namespace);
  }

  return _get_descendant_path(this._data, namespace);
};

/**
 * Locks State instance to avoid parallel writes
 *
 * @return {State} - State instance to enable chaning
 */
State.prototype.lock = function () {
  this._lock = true;
  this._old_data = _clone(this._data);
  return this;
};

/**
 * Unlocks State instance
 */
State.prototype.unlock = function () {
  this._lock = false;
  this._notify();
  this._old_data = undefined;
  this._changed_namespaces = [];
};

module.exports = State;
