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
	@param {Function} [options.onEvict] - Callback invoked with the key when an entry is evicted by GC.
	*/
	constructor(options = {}) {
		this.#onEvict = options.onEvict;
		this.#registry = new FinalizationRegistry(key => {
			this.#map.delete(key);
			if (this.#onEvict) {
				this.#onEvict(key);
			}
		});
	}

	/**
	Get the value for a key, or undefined if the key does not exist or has been collected.

	@param {*} key - The key to look up.
	@returns {object|undefined} The cached value, or undefined.
	*/
	get(key) {
		const reference = this.#map.get(key);
		if (reference === undefined) {
			return undefined;
		}

		const value = reference.deref();
		if (value === undefined) {
			this.#map.delete(key);
			return undefined;
		}

		return value;
	}

	/**
	Set a key-value pair. The value must be an object (required for WeakRef).

	@param {*} key - The key.
	@param {object} value - The value to cache. Must be an object.
	*/
	set(key, value) {
		if (typeof value !== 'object' && typeof value !== 'function') {
			throw new TypeError('Value must be an object or function, not a primitive');
		}

		if (value === null) {
			throw new TypeError('Value must be an object or function, not null');
		}

		const existing = this.#map.get(key);
		if (existing !== undefined) {
			const oldValue = existing.deref();
			if (oldValue !== undefined) {
				this.#registry.unregister(oldValue);
			}
		}

		this.#map.set(key, new WeakRef(value));
		this.#registry.register(value, key, value);
	}

	/**
	Check if a key exists and its value is still alive.

	@param {*} key - The key to check.
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

	@param {*} key - The key to delete.
	@returns {boolean} True if the entry existed.
	*/
	delete(key) {
		const reference = this.#map.get(key);
		if (reference !== undefined) {
			const value = reference.deref();
			if (value !== undefined) {
				this.#registry.unregister(value);
			}
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
