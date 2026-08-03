export const unique = <T>(...args: (T | undefined)[]) => {
  const set = new Set<T>();
  for (const arg of args) {
    if (arg) set.add(arg);
  }
  return Array.from(set);
};
