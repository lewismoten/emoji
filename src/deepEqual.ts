export const deepEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  switch (typeof a) {
    case "bigint":
    case "boolean":
    case "function":
    case "number":
    case "undefined":
    case "string":
    case "symbol":
      return false;
    case "object":
      if (a === null || b === null) return false;

      const aa = Array.isArray(a);
      const bb = Array.isArray(b);

      if (aa) {
        if (!bb) return false;
        return equalArrays(a, b);
      }

      if (bb) return false;

      const ao = Object.entries(a);
      const bo = Object.entries(b);

      return equalArrays(ao, bo);
  }
};
export const equalArrays = (a: any[], b: typeof a) => {
  const n = a.length;

  if (n !== b.length) return false;

  for (let i = 0; i < n; i++) {
    if (!deepEqual(a[i], b[i])) return false;
  }

  return true;
};
