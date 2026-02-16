import {expectType, expectError} from 'tsd';
import WeakCache from './index.js';

// Default type parameters
const cache = new WeakCache();
expectType<Record<string, unknown> | undefined>(cache.get('key'));
expectType<boolean>(cache.has('key'));
expectType<boolean>(cache.delete('key'));
expectType<number>(cache.size);

// Custom type parameters
const typedCache = new WeakCache<string, {id: number}>();
expectType<{id: number} | undefined>(typedCache.get('key'));
typedCache.set('key', {id: 1});

// With onEvict callback
const withEvict = new WeakCache<string>({
	onEvict(key) {
		expectType<string>(key);
	},
});

// Number keys
const numberCache = new WeakCache<number, {value: string}>();
numberCache.set(1, {value: 'one'});
expectType<{value: string} | undefined>(numberCache.get(1));

// Errors for primitive values
expectError(typedCache.set('key', 'string'));
expectError(typedCache.set('key', 42));
