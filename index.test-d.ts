import { expectError, expectType } from "tsd";
import WeakCache from "./index.js";

// Default type parameters
const cache = new WeakCache();
expectType<Record<string, unknown> | undefined>(cache.get("key"));
expectType<boolean>(cache.has("key"));
expectType<boolean>(cache.delete("key"));
expectType<number>(cache.size);

// Custom type parameters
const typedCache = new WeakCache<string, { id: number }>();
expectType<{ id: number } | undefined>(typedCache.get("key"));
typedCache.set("key", { id: 1 });

// With onEvict callback
const _withEvict = new WeakCache<string>({
  onEvict(key) {
    expectType<string>(key);
  },
});

// Number keys
const numberCache = new WeakCache<number, { value: string }>();
numberCache.set(1, { value: "one" });
expectType<{ value: string } | undefined>(numberCache.get(1));

// Errors for primitive values
expectError(typedCache.set("key", "string"));
expectError(typedCache.set("key", 42));

const functions = new WeakCache<string, () => number>();
functions.set("callback", () => 42);
expectType<(() => number) | undefined>(functions.get("callback"));
const arrays = new WeakCache<string, number[]>();
arrays.set("items", [1, 2]);
expectType<number[] | undefined>(arrays.get("items"));
const dates = new WeakCache<string, Date>();
dates.set("date", new Date());
expectType<Date | undefined>(dates.get("date"));
expectError(new WeakCache<string, string>());
