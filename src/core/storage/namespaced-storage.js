const DEFAULT_NAMESPACE = 'sad-sock';

function makeKey(namespace, key) {
  return `${namespace}:${key}`;
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export class NamespacedStorage {
  constructor(namespace = DEFAULT_NAMESPACE, storage = globalThis?.localStorage) {
    this.namespace = namespace || DEFAULT_NAMESPACE;
    this.storage = storage;
  }

  _withStorage(fn, fallback = null) {
    if (!this.storage) return fallback;
    try {
      return fn(this.storage);
    } catch (err) {
      console.warn('[storage] operation failed', err);
      return fallback;
    }
  }

  getItem(key, fallback = null) {
    return this._withStorage(store => store.getItem(makeKey(this.namespace, key)), fallback);
  }

  setItem(key, value) {
    return this._withStorage(store => {
      store.setItem(makeKey(this.namespace, key), value);
      return true;
    }, false);
  }

  removeItem(key) {
    return this._withStorage(store => {
      store.removeItem(makeKey(this.namespace, key));
      return true;
    }, false);
  }

  getNumber(key, fallback = 0) {
    const raw = this.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const num = Number(raw);
    return Number.isFinite(num) ? num : fallback;
  }

  setNumber(key, value) {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Cannot persist non-finite number for key "${key}"`);
    }
    return this.setItem(key, String(value));
  }

  getJSON(key, fallback = null) {
    const raw = this.getItem(key);
    if (typeof raw !== 'string' || raw.trim() === '') return fallback;
    try {
      const data = JSON.parse(raw);
      return isPlainObject(data) ? data : fallback;
    } catch (err) {
      console.warn('[storage] failed to parse JSON', err);
      return fallback;
    }
  }

  setJSON(key, value, validator) {
    if (validator && !validator(value)) {
      throw new TypeError('Provided value did not pass validation');
    }
    if (!isPlainObject(value)) {
      throw new TypeError('Only plain objects can be saved as JSON payloads');
    }
    return this.setItem(key, JSON.stringify(value));
  }
}

export function createGameStorage(gameId) {
  if (!gameId) throw new Error('A game identifier is required to create namespaced storage');
  return new NamespacedStorage(`game:${gameId}`);
}
