type ValueTransformer<T> = (value: T) => T;

export type StoreOptions<T> = {
  transform?: ValueTransformer<T>;
};

export type ArrayStoreOptions<T> = StoreOptions<T[]> & {
  unique?: boolean;
};

const transform = <T>(value: T, transformer?: ValueTransformer<T>): T =>
  transformer ? transformer(value) : value;

/** Creates a small synchronous store for shared application state. */
export const createStore = <T>(
  initialValue: T,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  let value = initialValue;

  return {
    get: () => value,
    set: (nextValue: T) => {
      value = transform(nextValue, transformer);
    },
  };
};

export const createArrayStore = <T>(
  initialValue: T[],
  { transform: transformer, unique = false }: ArrayStoreOptions<T> = {},
) => {
  let value = initialValue;

  return {
    get: () => value,
    set: (nextValue: T[]) => {
      value = transform(nextValue, transformer);
    },
    clear: () => {
      value = [];
    },
    has: (item: T) => value.includes(item),
    remove: (item: T): boolean | number => {
      if (unique) {
        const index = value.indexOf(item);
        if (index === -1) return false;
        value = value.toSpliced(index, 1);
        return true;
      }

      const previousLength = value.length;
      value = value.filter((candidate) => candidate !== item);
      return previousLength - value.length;
    },
    add: (item: T): boolean => {
      if (unique && value.includes(item)) return false;
      value.push(item);
      return true;
    },
  };
};

export const createMapStore = <T>(
  initialValue: Map<string, T>,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  let value = initialValue;

  const get = ((key?: string) =>
    typeof key === "string" ? value.get(key) : value) as {
    (): Map<string, T>;
    (key: string): T | undefined;
  };

  return {
    get,
    set: (key: string, item: T) => {
      value.set(key, transform(item, transformer));
    },
    replace: (nextValue: Map<string, T>) => {
      value = nextValue;
    },
    clear: () => {
      value.clear();
    },
  };
};

export const createRecordStore = <T>(
  initialValue: Record<string, T>,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  let value = initialValue;

  const get = ((key?: string) =>
    typeof key === "string" ? value[key] : value) as {
    (): Record<string, T>;
    (key: string): T | undefined;
  };

  return {
    get,
    set: (key: string, item: T) => {
      value[key] = transform(item, transformer);
    },
    replace: (nextValue: Record<string, T>) => {
      value = nextValue;
    },
    clear: () => {
      value = {};
    },
  };
};

export const createSetStore = <T>(
  initialValue: Set<T>,
  { transform: transformer }: StoreOptions<Set<T>> = {},
) => {
  let value = initialValue;

  return {
    get: () => value,
    first: (): T | undefined => value.values().next().value,
    replace: (nextValue: Set<T>) => {
      value = transform(nextValue, transformer);
    },
    clear: () => {
      value.clear();
    },
  };
};

export const createNumberStore = <T extends number>(
  initialValue: T,
  { transform: transformer }: StoreOptions<T> = {},
) => {
  let value = initialValue;

  return {
    get: () => value,
    set: (nextValue: T) => {
      value = transform(nextValue, transformer);
    },
    increment: () => ++value,
  };
};
