import test from "ava";
import WeakCache from "./index.js";

function withRegistryFixture(run) {
  const OriginalRegistry = globalThis.FinalizationRegistry;
  const OriginalWeakRef = globalThis.WeakRef;
  let registry;
  const references = [];
  class RegistryFixture {
    registrations = [];
    constructor(callback) {
      this.callback = callback;
      registry = this;
    }
    register(_target, held, token) {
      this.registrations.push({ held, token });
    }
    unregister(token) {
      const previous = this.registrations.length;
      this.registrations = this.registrations.filter(
        (entry) => entry.token !== token
      );
      return this.registrations.length !== previous;
    }
  }
  class WeakRefFixture {
    constructor(value) {
      this.value = value;
      references.push(this);
    }
    deref() {
      return this.value;
    }
  }
  globalThis.FinalizationRegistry = RegistryFixture;
  globalThis.WeakRef = WeakRefFixture;
  try {
    run(() => registry, references);
  } finally {
    globalThis.FinalizationRegistry = OriginalRegistry;
    globalThis.WeakRef = OriginalWeakRef;
  }
}

test.serial(
  "a collected old value cannot evict a newer entry with the same key",
  (t) => {
    withRegistryFixture((getRegistry, references) => {
      const evicted = [];
      const cache = new WeakCache({ onEvict: (key) => evicted.push(key) });
      cache.set("key", { old: true });
      const registry = getRegistry();
      const oldHeld = registry.registrations[0].held;
      references[0].value = undefined;
      const fresh = { fresh: true };
      cache.set("key", fresh);
      registry.callback(oldHeld);
      t.is(cache.get("key"), fresh);
      t.deepEqual(evicted, []);
    });
  }
);

test.serial(
  "deleting one alias keeps another alias registered for eviction",
  (t) => {
    withRegistryFixture((getRegistry) => {
      const evicted = [];
      const cache = new WeakCache({ onEvict: (key) => evicted.push(key) });
      const shared = {};
      cache.set("first", shared);
      cache.set("second", shared);
      cache.delete("first");
      const registry = getRegistry();
      t.is(registry.registrations.length, 1);
      registry.callback(registry.registrations[0].held);
      t.is(cache.size, 0);
      t.deepEqual(evicted, ["second"]);
    });
  }
);
