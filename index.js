/**
A WeakRef-based cache that automatically evicts entries when values are garbage collected.
*/
export default class WeakCache {
  #map = new Map();
  #registry;
  #onEvict;

  /**
	Create a new WeakCache.

	@param {object} [options] - Options for the cache.
	@param {(...arguments_: unknown[]) => unknown} [options.onEvict] - Callback invoked with the key when an entry is evicted by GC.
	*/
  constructor(options = {}) {
    this.#onEvict = options.onEvict;
    this.#registry = new FinalizationRegistry(({ key, reference }) => {
      if (this.#map.get(key) !== reference) {
        return;
      }
      this.#map.delete(key);
      if (this.#onEvict) {
        this.#onEvict(key);
      }
    });
  }

  /**
	Get the value for a key, or undefined if the key does not exist or has been collected.

	@param {unknown} key - The key to look up.
	@returns {object|undefined} The cached value, or undefined.
	*/
  get(key) {
    const reference = this.#map.get(key);
    if (reference === undefined) {
      return;
    }

    const value = reference.deref();
    if (value === undefined) {
      this.#map.delete(key);
      return;
    }

    return value;
  }

  /**
	Set a key-value pair. The value must be an object (required for WeakRef).

	@param {unknown} key - Lookup key, held strongly; only the value is weakly referenced.
	@param {object} value - Object or function to cache weakly, so it can be collected once nothing else holds it. Primitives are rejected.
	*/
  set(key, value) {
    if (typeof value !== "object" && typeof value !== "function") {
      throw new TypeError(
        "Value must be an object or function, not a primitive"
      );
    }

    if (value === null) {
      throw new TypeError("Value must be an object or function, not null");
    }

    const existing = this.#map.get(key);
    if (existing !== undefined) {
      this.#registry.unregister(existing);
    }

    const reference = new WeakRef(value);
    this.#map.set(key, reference);
    this.#registry.register(value, { key, reference }, reference);
  }

  /**
	Check if a key exists and its value is still alive.

	@param {unknown} key - The key to check.
	@returns {boolean} True if the key exists and the value is alive.
	*/
  has(key) {
    const reference = this.#map.get(key);
    if (reference === undefined) {
      return false;
    }

    if (reference.deref() === undefined) {
      this.#map.delete(key);
      return false;
    }

    return true;
  }

  /**
	Delete an entry.

	@param {unknown} key - The key to delete.
	@returns {boolean} True if the entry existed.
	*/
  delete(key) {
    const reference = this.#map.get(key);
    if (reference !== undefined) {
      this.#registry.unregister(reference);
    }

    return this.#map.delete(key);
  }

  /**
	Get the approximate size of the cache. May include entries with collected values.

	@returns {number} The approximate number of entries.
	*/
  get size() {
    return this.#map.size;
  }
}
