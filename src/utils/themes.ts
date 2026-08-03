import { ExplorerMusicSong } from "../explorer/audio/music/explorer-audio-song-types.js";
import documentRef from "./document.js";

const THEME_BASE = "base";
const THEME_RETRO = "retro";
const THEME_LIGHT = "light";
const THEME_DARK = "dark";
const THEME_DEFAULT = THEME_DARK;

type ThemeOptions = {
  color?: string;
  loadSong?: () => Promise<{ default: ExplorerMusicSong }>;
};
const themes = new Map<string, ThemeOptions | undefined>();
const songs = new Map<string, ExplorerMusicSong>();

export const register = (name: string, options?: ThemeOptions) => {
  themes.set(name, options);
};
register(THEME_DARK, {
  color: "#160622",
  loadSong: () => import("../explorer/audio/music/dark-song.js"),
});
register(THEME_BASE);
register(THEME_LIGHT, {
  color: "#f6efe4",
  loadSong: () => import("../explorer/audio/music/light-song.js"),
});
register(THEME_RETRO, {
  color: "#0000aa",
  loadSong: () => import("../explorer/audio/music/retro-song.js"),
});

export const isTheme = (name: string): boolean => getTheme() === name;
export const getTheme = (): string =>
  documentRef()?.documentElement?.dataset?.theme ?? THEME_DEFAULT;
const getOptions = () => themes.get(getTheme());
export const getSong = async () => {
  const options = getOptions();
  if (!options) return;
  if (!options.loadSong) return;
  const theme = getTheme();
  if (songs.has(theme)) return songs.get(theme);
  const song = (await options.loadSong()).default;
  songs.set(theme, song);
  return song;
};
export const canThemeSupportAudio = async () => {
  const song = await getSong();
  return song !== void 0;
};
export const getColor = (): string => getOptions()?.color ?? "#160622";
