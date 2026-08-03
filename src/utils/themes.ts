import documentRef from "./document-ref.js";

export const isTheme = (name: string): boolean =>
  documentRef()?.documentElement?.dataset?.theme === name;
export const isBaseTheme = () => isTheme("base");
export const isRetroTheme = () => isTheme("retro");
export const canThemeSupportAudio = () => !isTheme("base");
