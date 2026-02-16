import test from 'ava';
import WeakCache from './index.js';

test('set and get', t => {
	const cache = new WeakCache();
	const value = {data: 'hello'};
	cache.set('key', value);
	t.is(cache.get('key'), value);
});

test('get returns undefined for missing key', t => {
	const cache = new WeakCache();
	t.is(cache.get('missing'), undefined);
});

test('has returns true for live entries', t => {
	const cache = new WeakCache();
	const value = {data: 'test'};
	cache.set('key', value);
	t.true(cache.has('key'));
});

test('has returns false for missing key', t => {
	const cache = new WeakCache();
	t.false(cache.has('missing'));
});

test('delete removes entry', t => {
	const cache = new WeakCache();
	const value = {data: 'test'};
	cache.set('key', value);
	t.true(cache.delete('key'));
	t.is(cache.get('key'), undefined);
	t.false(cache.has('key'));
});

test('delete returns false for missing key', t => {
	const cache = new WeakCache();
	t.false(cache.delete('missing'));
});

test('delete returns true for existing key', t => {
	const cache = new WeakCache();
	cache.set('key', {data: 'test'});
	t.true(cache.delete('key'));
});

test('throws TypeError for primitive string value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', 'string'),
		{instanceOf: TypeError},
	);
});

test('throws TypeError for primitive number value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', 42),
		{instanceOf: TypeError},
	);
});

test('throws TypeError for primitive boolean value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', true),
		{instanceOf: TypeError},
	);
});

test('throws TypeError for null value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', null),
		{instanceOf: TypeError},
	);
});

test('throws TypeError for undefined value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', undefined),
		{instanceOf: TypeError},
	);
});

test('throws TypeError for symbol value', t => {
	const cache = new WeakCache();
	t.throws(
		() => cache.set('key', Symbol('test')),
		{instanceOf: TypeError},
	);
});

test('allows function values', t => {
	const cache = new WeakCache();
	const function_ = () => {};
	cache.set('key', function_);
	t.is(cache.get('key'), function_);
});

test('allows array values', t => {
	const cache = new WeakCache();
	const array = [1, 2, 3];
	cache.set('key', array);
	t.is(cache.get('key'), array);
});

test('size property', t => {
	const cache = new WeakCache();
	t.is(cache.size, 0);
	cache.set('a', {v: 1});
	t.is(cache.size, 1);
	cache.set('b', {v: 2});
	t.is(cache.size, 2);
	cache.delete('a');
	t.is(cache.size, 1);
});

test('overwriting a key', t => {
	const cache = new WeakCache();
	const value1 = {v: 1};
	const value2 = {v: 2};
	cache.set('key', value1);
	cache.set('key', value2);
	t.is(cache.get('key'), value2);
	t.is(cache.size, 1);
});

test('onEvict option type', t => {
	const cache = new WeakCache({
		onEvict(key) {
			t.is(typeof key, 'string');
		},
	});
	t.truthy(cache);
});

test('multiple keys', t => {
	const cache = new WeakCache();
	const a = {a: 1};
	const b = {b: 2};
	const c = {c: 3};
	cache.set('a', a);
	cache.set('b', b);
	cache.set('c', c);
	t.is(cache.get('a'), a);
	t.is(cache.get('b'), b);
	t.is(cache.get('c'), c);
	t.is(cache.size, 3);
});

test('number keys', t => {
	const cache = new WeakCache();
	const value = {data: 'test'};
	cache.set(1, value);
	t.is(cache.get(1), value);
	t.true(cache.has(1));
});

test('constructor with no options', t => {
	const cache = new WeakCache();
	t.is(cache.size, 0);
});

test('delete after set then get', t => {
	const cache = new WeakCache();
	const value = {data: 'test'};
	cache.set('key', value);
	cache.delete('key');
	t.is(cache.get('key'), undefined);
	t.is(cache.size, 0);
});

test('has after delete returns false', t => {
	const cache = new WeakCache();
	cache.set('key', {data: 'test'});
	cache.delete('key');
	t.false(cache.has('key'));
});
