type ValueTransformer<T> = (value: T) => T;

export type StoreOptions<T> = {
  transform?: ValueTransformer<T>;
};

export type ArrayStoreOptions<T> = StoreOptions<T[]> & {
  unique?: boolean;
};

const transform = <T>(value: T, transformer?: ValueTransformer<T>): T =>
  transformer ? transformer(value) : value;

const createBaseStore = <T>(
  initialValue: T,
  transformer?: ValueTransformer<T>,
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
  };
};

/** Creates a small synchronous store for shared application state. */
export const createStore = <T>(
  initialValue: T,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  const { get, set } = createBaseStore(initialValue, transformer);
  return { get, set };
};

export const createArrayStore = <T>(
  initialValue: T[],
  { transform: transformer, unique = false }: ArrayStoreOptions<T> = {},
) => {
  const { get, set, replace } = createBaseStore(initialValue, transformer);
  const clear = () => replace([]);
  const has = (item: T) => get().includes(item);
  const remove = (item: T): boolean | number => {
    const value = get();
    if (unique) {
      const index = value.indexOf(item);
      if (index === -1) return false;
      replace(value.toSpliced(index, 1));
      return true;
    }
    const previousLength = value.length;
    const nextValue = value.filter((candidate) => candidate !== item);
    replace(nextValue);
    return previousLength - nextValue.length;
  };
  const add = (item: T): boolean => {
    const value = get();
    if (unique && value.includes(item)) return false;
    replace([...value, item]);
    return true;
  };
  return { get, set, clear, has, remove, add };
};

export const createMapStore = <T>(
  initialValue: Map<string, T>,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  const { get: _map, replace } = createBaseStore(initialValue);
  const get = ((key?: string) =>
    typeof key === "string" ? _map().get(key) : _map()) as {
    (): Map<string, T>;
    (key: string): T | undefined;
  };
  const set = (key: string, item: T) => {
    _map().set(key, transform(item, transformer));
  };
  const clear = () => _map().clear();
  return { get, set, replace, clear };
};

export const createRecordStore = <T>(
  initialValue: Record<string, T>,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  const { get: _record, replace } = createBaseStore(initialValue);
  const get = ((key?: string) =>
    typeof key === "string" ? _record()[key] : _record()) as {
    (): Record<string, T>;
    (key: string): T | undefined;
  };
  const set = (key: string, item: T) => {
    _record()[key] = transform(item, transformer);
  };
  const clear = () => replace({});

  return { get, set, replace, clear };
};

export const createSetStore = <T>(
  initialValue: Set<T>,
  { transform: transformer }: StoreOptions<Set<T>> = {},
) => {
  const { get, set } = createBaseStore(initialValue, transformer);
  const first = (): T | undefined => get().values().next().value;
  const replace = set;
  const clear = () => get().clear();
  return { get, first, replace, clear };
};

export const createNumberStore = <T extends number>(
  initialValue: T,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  const { get, set, replace } = createBaseStore(initialValue, transformer);

  const increment = () => {
    const nextValue = (get() + 1) as T;
    replace(nextValue);
    return nextValue;
  };
  return { get, set, increment };
};
