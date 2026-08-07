import { deepEqual } from "./deepEqual";

// NOTE: shallow copies are returned from Array/Set/Map/Record
// If they store an object, it can still be mutated

type ValueTransformer<T> = (value: T) => T;
type Equal<T> = (a: T, b: T) => boolean;

export type StoreOptions<T, E = T> = {
  transform?: ValueTransformer<T>;
  equal?: Equal<E>;
};

export type ArrayStoreOptions<T> = StoreOptions<T, T[]> & {
  unique?: boolean;
};

const transform = <T>(value: T, transformer?: ValueTransformer<T>): T =>
  transformer ? transformer(value) : value;

const createBaseStore = <T>(
  initialValue: T,
  transformer?: ValueTransformer<T>,
  equalValues: Equal<T> = deepEqual,
) => {
  let value = initialValue;

  return {
    get: () => value,
    replace: (nextValue: T) => {
      value = nextValue;
    },
    set: (nextValue: T) => {
      value = transform(nextValue, transformer);
    },
    isDefault: () => {
      if (value === initialValue) return true;
      return equalValues(initialValue, value);
    },
    original: () => initialValue,
  };
};

/** Creates a small synchronous store for shared application state. */
export const createStore = <T>(
  initialValue: T,
  { transform: transformer, equal: equalValues }: StoreOptions<T, T> = {},
) => {
  const { get, set, isDefault } = createBaseStore(
    initialValue,
    transformer,
    equalValues,
  );
  return { get, set, isDefault };
};

export const createArrayStore = <T>(
  initialValue: T[],
  {
    transform: transformer,
    equal: equalValues,
    unique = false,
  }: ArrayStoreOptions<T> = {},
) => {
  const {
    get: _get,
    replace: _replace,
    isDefault,
  } = createBaseStore([...initialValue], undefined, equalValues);

  const first = (): T | undefined => _get().at(0);
  const last = (): T | undefined => _get().at(-1);

  const clear = () => _replace([]);
  const has = (item: T) => _get().includes(item);
  const remove = (item: T): boolean | number => {
    const value = _get();
    if (unique) {
      const index = value.indexOf(item);
      if (index === -1) return false;
      _replace(value.toSpliced(index, 1));
      return true;
    }
    const previousLength = value.length;
    const nextValue = value.filter((candidate) => candidate !== item);
    _replace(nextValue);
    return previousLength - nextValue.length;
  };
  const add = (item: T): boolean => {
    const value = _get();
    const next = transformer ? transformer(item) : item;
    if (unique && value.includes(next)) return false;
    _replace([...value, next]);
    return true;
  };

  const replace = (value: T[]) =>
    _replace(value.map((v) => (transformer ? transformer(v) : v)));
  const get = () => Array.from(_get());

  return { get, clear, has, first, last, remove, add, isDefault, replace };
};

type MapSetListener<T> = (key: string, value: T) => void;

export const createMapStore = <T>(
  initialValue: Map<string, T>,
  {
    transform: transformer,
    equal: equalValues,
  }: StoreOptions<T, Map<string, T>> = {},
) => {
  let setListeners: Set<MapSetListener<T>> | undefined;
  const addListener = (name: "set", listener: MapSetListener<T>) => {
    setListeners ??= new Set();
    setListeners.add(listener);
  };
  const removeListener = (
    name: "set",
    listener?: (name: string, value: T) => void,
  ) => {
    if (setListeners === undefined) return;
    if (!listener) {
      setListeners = undefined;
      return;
    }
    setListeners.delete(listener);
    if (setListeners.size === 0) setListeners = undefined;
  };
  const {
    get: _map,
    replace: _replace,
    original,
  } = createBaseStore(new Map(initialValue));
  const get = ((key?: string) =>
    typeof key === "string" ? _map().get(key) : new Map(_map())) as {
    (): Map<string, T>;
    (key: string): T | undefined;
  };
  const set = (key: string, item: T) => {
    const next = new Map(_map());
    const nextItem = transform(item, transformer);
    next.set(key, nextItem);
    _replace(next);
    for (const listener of setListeners ?? []) {
      listener(key, nextItem);
    }
  };
  const clear = () => _replace(new Map());
  const replace = (value: Map<string, T>) => _replace(new Map(value));
  const isDefault = () => {
    const o = original(),
      v = get();
    return equalValues ? equalValues(o, v) : deepEqual(o, v);
  };

  return { get, set, replace, clear, isDefault, addListener, removeListener };
};

export const createRecordStore = <T>(
  initialValue: Record<string, T>,
  {
    transform: transformer,
    equal: equalValues,
  }: StoreOptions<T, Record<string, T>> = {},
) => {
  const {
    get: _record,
    replace: _replace,
    original,
  } = createBaseStore({ ...initialValue });
  const get = ((key?: string) =>
    typeof key === "string" ? _record()[key] : { ..._record() }) as {
    (): Record<string, T>;
    (key: string): T | undefined;
  };
  const set = (key: string, item: T) => {
    _replace({
      ..._record(),
      [key]: transform(item, transformer),
    });
  };
  const clear = () => _replace({});
  const replace = (value: Record<string, T>) => _replace({ ...value });
  const isDefault = () => {
    const o = original(),
      v = get();
    return equalValues ? equalValues(o, v) : deepEqual(o, v);
  };

  return { get, set, replace, clear, isDefault };
};

export const createSetStore = <T>(
  initialValue: Set<T>,
  { transform: transformer, equal: equalValues }: StoreOptions<T, Set<T>> = {},
) => {
  const {
    get: _get,
    replace: _replace,
    original,
  } = createBaseStore(new Set(initialValue));
  const get = () => new Set(_get());
  const first = (): T | undefined => _get().values().next().value;
  const add = (item: T) => {
    const next = new Set(_get());
    next.add(transform(item, transformer));
    _replace(next);
  };
  const replace = (value: Set<T>) => _replace(new Set(value));
  const clear = () => _replace(new Set());
  const isDefault = () => {
    const o = original();
    const v = _get();
    return equalValues ? equalValues(o, v) : deepEqual(o, v);
  };
  return { get, first, replace, clear, isDefault, add };
};

export const createNumberStore = (
  initialValue: number,
  { transform: transformer, equal: equalValues }: StoreOptions<number> = {},
) => {
  const { get, set, isDefault } = createBaseStore(
    initialValue,
    transformer,
    equalValues,
  );

  const increment = () => {
    const nextValue = get() + 1;
    set(nextValue);
    return get();
  };
  return { get, set, increment, isDefault };
};
