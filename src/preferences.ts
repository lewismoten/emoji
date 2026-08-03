import * as win from "./utils/window.js";

const KEY = "@lewismoten/emoji:explorer-preferences";

export enum preferences {
  soundEffects,
  music,
  mode,
  theme,
  pixelFont,
  order,
  favorites,
  recentCopied,
  locale,
}

let data: Record<string, any> = win.initialPreferences();

const load = (state: Record<string, any> = {}) => {
  try {
    return JSON.parse(
      window.localStorage.getItem(KEY) ?? JSON.stringify(state),
    );
  } catch {
    return state;
  }
};

const clamp = <T>(name: string, allowed: T[], fallback: T) => {
  const value = data[name];
  if (!allowed.includes(value)) return (data[name] = fallback);
};
export const init = (state: any) => {
  data = load(state);
  clamp("mode", ["standard", "advanced", "developer"], "standard");
  clamp("theme", ["base", "dark", "light", "retro"], "dark");
};
export const has = (name: keyof typeof preferences): boolean =>
  Object.hasOwn(data, name);

export const set = <T = any>(name: keyof typeof preferences, value: T) => {
  data[name] = value;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Preferences are optional when storage is unavailable or blocked.
  }
};
export const setBoolean = (name: keyof typeof preferences, value: boolean) => {
  set(name, value);
};
export const setString = (name: keyof typeof preferences, value: string) => {
  set(name, value);
};
export const setArray = <T = any>(
  name: keyof typeof preferences,
  value: T[],
) => {
  set(name, value);
};
export const setStringArray = (
  name: keyof typeof preferences,
  value: string[],
) => {
  set(name, value);
};

export const get = <T = any>(name: keyof typeof preferences): T | undefined => {
  return data[name];
};
export const getBoolean = (name: keyof typeof preferences): boolean => {
  return get(name) === true;
};
export const getString = (name: keyof typeof preferences): string => {
  return (get(name) as string) ?? "";
};
export const getArray = <T = any>(name: keyof typeof preferences): T[] => {
  return Array.isArray(get(name)) ? (get(name) as T[]) : [];
};
export const getStringArray = (name: keyof typeof preferences): string[] => {
  return Array.isArray(get(name)) ? (get(name) as string[]) : [];
};
