import { ExplorerMusicSong } from "../explorer/audio/music/explorer-audio-song-types.js";
import documentRef from "./document.js";

const THEME_BASE = "base";
const THEME_RETRO = "retro";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const THEME_DEFAULT = THEME_DARK;

type ThemeOptions = {
  loadSong?: () => Promise<{ default: ExplorerMusicSong }>;
};
const themes = new Map<string, ThemeOptions | undefined>();
const songs = new Map<string, ExplorerMusicSong>();

export const register = (name: string, options?: ThemeOptions) => {
  themes.set(name, options);
};
register(THEME_DARK, {
  loadSong: () => import("../explorer/audio/music/dark-song.js"),
});
register(THEME_BASE);
register(THEME_LIGHT, {
  loadSong: () => import("../explorer/audio/music/light-song.js"),
});
register(THEME_RETRO, {
  loadSong: () => import("../explorer/audio/music/retro-song.js"),
});

export const isTheme = (name: string): boolean => getTheme() === name;
export const getTheme = (): string =>
  documentRef()?.documentElement?.dataset?.theme ?? THEME_DEFAULT;
export const getSong = async () => {
  const theme = getTheme();
  const options = themes.get(theme);
  if (!options) return;
  if (!options.loadSong) return;
  if (songs.has(theme)) return songs.get(theme);
  const song = (await options.loadSong()).default;
  songs.set(theme, song);
  return song;
};
export const canThemeSupportAudio = async () => {
  const song = await getSong();
  return song !== void 0;
};
