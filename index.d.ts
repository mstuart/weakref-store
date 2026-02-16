export type WeakCacheOptions<K> = {
	/**
	Callback invoked with the key when an entry is evicted by garbage collection.

	@param key - The key of the evicted entry.
	*/
	readonly onEvict?: (key: K) => void;
};

/**
A WeakRef-based cache that automatically evicts entries when values are garbage collected.

@example
```
import WeakCache from 'weakref-store';

const cache = new WeakCache();

let value = {data: 'hello'};
cache.set('key', value);

console.log(cache.get('key'));
//=> {data: 'hello'}

console.log(cache.has('key'));
//=> true
```
*/
export default class WeakCache<K = string, V extends Record<string, unknown> = Record<string, unknown>> {
	/**
	The approximate size of the cache. May include entries with collected values.
	*/
	readonly size: number;

	/**
	Create a new WeakCache.

	@param options - Options for the cache.
	*/
	constructor(options?: WeakCacheOptions<K>);

	/**
	Get the value for a key, or `undefined` if the key does not exist or has been collected.

	@param key - The key to look up.
	@returns The cached value, or `undefined`.
	*/
	get(key: K): V | undefined;

	/**
	Set a key-value pair. The value must be an object (required for WeakRef).

	@param key - The key.
	@param value - The value to cache. Must be an object.
	*/
	set(key: K, value: V): void;

	/**
	Check if a key exists and its value is still alive.

	@param key - The key to check.
	@returns `true` if the key exists and the value is alive.
	*/
	has(key: K): boolean;

	/**
	Delete an entry.

	@param key - The key to delete.
	@returns `true` if the entry existed.
	*/
	delete(key: K): boolean;
}
