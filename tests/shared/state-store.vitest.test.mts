import { describe, expect, it } from "vitest";

import {
  createArrayStore,
  createMapStore,
  createNumberStore,
  createRecordStore,
  createSetStore,
  createStore,
} from "../../src/state-store.js";

describe("state stores", () => {
  it("stores transformed scalar values", () => {
    const store = createStore("initial", {
      transform: (value) => value.trim(),
    });

    store.set(" next ");

    expect(store.get()).toBe("next");
  });

  it("manages arrays and removes a unique item without replacing the array with the removed value", () => {
    const store = createArrayStore(["one", "two"], { unique: true });

    expect(store.has("one")).toBe(true);
    expect(store.add("one")).toBe(false);
    expect(store.add("three")).toBe(true);
    expect(store.remove("two")).toBe(true);
    expect(store.remove("missing")).toBe(false);
    expect(store.get()).toEqual(["one", "three"]);

    store.set(["replacement"]);
    expect(store.get()).toEqual(["replacement"]);

    store.clear();
    expect(store.get()).toEqual([]);
  });

  it("removes every matching item from non-unique arrays", () => {
    const store = createArrayStore(["one", "two", "one"]);

    expect(store.remove("one")).toBe(2);
    expect(store.get()).toEqual(["two"]);
  });

  it("manages map and record entries", () => {
    const map = createMapStore(new Map<string, string>(), {
      transform: (value) => value.toUpperCase(),
    });
    const record = createRecordStore<string>({});

    map.set("first", "value");
    record.set("first", "value");

    expect(map.get("first")).toBe("VALUE");
    expect(map.get()).toEqual(new Map([["first", "VALUE"]]));
    expect(record.get("first")).toBe("value");

    map.clear();
    map.replace(new Map([["second", "replacement"]]));
    record.replace({ second: "replacement" });
    record.clear();

    expect(map.get()).toEqual(new Map([["second", "replacement"]]));
    expect(record.get()).toEqual({});
  });

  it("manages set and numeric state", () => {
    const set = createSetStore(new Set(["first", "second"]), {
      transform: (value) =>
        new Set([...value].map((item) => item.toUpperCase())),
    });
    const number = createNumberStore(1);

    expect(set.first()).toBe("first");
    set.clear();
    set.replace(new Set(["replacement"]));
    number.set(2);

    expect([...set.get()]).toEqual(["REPLACEMENT"]);
    expect(number.get()).toBe(2);
    expect(number.increment()).toBe(3);
  });
});
