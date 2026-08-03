import documentRef from "./document.js";

export const isTheme = (name: string): boolean => getTheme() === name;
export const isBaseTheme = () => isTheme("base");
export const canThemeSupportAudio = () => !isTheme("base");
export const getTheme = (): string =>
  documentRef()?.documentElement?.dataset?.theme ?? "dark";
