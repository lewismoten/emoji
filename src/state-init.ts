type ValueTransformer<T> = (value: T) => T;

const transformIfProvided = <T>(value: T, transformer?: ValueTransformer<T>) =>
  transformer ? transformer(value) : value;

export const init = <T = any>(defaultValue: T, transformer?: ValueTransformer<T>) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T) => {
    _value = transformIfProvided(value, transformer);
  };
  return { get, set };
};
export const initArray = <T = any>(defaultValue: T[], transformer?: ValueTransformer<T[]>, isUnique: boolean = false) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T[]) => {
    _value = transformIfProvided(value, transformer);
  };
  const clear = () => {
    _value = [];
  }
  const has = (value: T) => _value.includes(value);
  const remove = (value: T): boolean | number => {
    if(isUnique) {
      const index = _value.indexOf(value);
      if(index !== -1) {
        _value = _value.splice(index, 1);
        return true;
      }
      return false;
    }
    const original = _value.length;
    _value = _value.filter(v => v !== value);
    return original - _value.length;
  }
  const add = (value: T): boolean => {
    if(isUnique && has(value)) return false;
    _value.push(value);
    return true;
  }
  return { get, set, clear, remove, add };
};

export const initMap = <T = any>(
  defaultValue: Map<string, T>,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = ((name?: string) =>
    typeof name === "string" ? _value.get(name) : _value) as {
    (): Map<string, T>;
    (name: string): T | undefined;
  };
  const set = (name: string, value: T) => {
    _value.set(name, transformIfProvided(value, transformer));
  };
  const replace = (value: Map<string, T>) => {
    _value = value;
  };
  const clear = () => {
    _value.clear();
  };
  return { get, set, clear, replace };
};
export const initRecord = <T = any>(
  defaultValue: Record<string, T>,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = ((name?: string) =>
    typeof name === "string" ? _value[name] : _value) as {
    (): Record<string, T>;
    (name: string): T | undefined;
  };
  const set = (name: string, value: T) => {
    _value[name] = transformIfProvided(value, transformer);
  };
  const clear = () => {
    _value = {};
  };
  const replace = (replacement: Record<string, T>) => {
    _value = replacement;
  };
  return { get, set, clear, replace };
};
export const initSet = <T = any>(
  defaultValue: Set<T>,
  transformer?: ValueTransformer<Set<T>>,
) => {
  let _value = defaultValue;
  const get = () => _value;
  const first = (): T | undefined => _value.values().next().value;
  const replace = (value: Set<T>) => {
    _value = transformIfProvided(value, transformer);
  };
  const clear = () => {
    _value.clear();
  };
  return { get, first, replace, clear };
};
export const initNum = <T extends number = number>(
  defaultValue: T,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T) => {
    _value = transformIfProvided(value, transformer);
  };
  const increment = () => ++_value;
  return { get, set, increment };
};
