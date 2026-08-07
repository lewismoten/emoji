import { parseExplorerModeParam } from "../explorer/navigation/url-state.js";
import * as preferences from "../preferences.js";
import * as globalState from "../state.js";

export function initializeExplorerPreferences(state: any) {
  preferences.init(state);
  const explorerModeFromUrl = parseExplorerModeParam(window.location.search);
  const developerModeFromUrl = explorerModeFromUrl === "developer";
  const favoriteEmojiKeys = preferences.getStringArray("favorites");
  const copiedEmojiKeys = preferences.getStringArray("recentCopied");

  state.explorerModeFromUrl = explorerModeFromUrl;
  state.developerModeFromUrl = developerModeFromUrl;
  state.favoriteEmojiKeys = favoriteEmojiKeys;
  state.copiedEmojiKeys = copiedEmojiKeys;

  globalState.explorerModeFromUrl.set(
    explorerModeFromUrl === "" ? undefined : explorerModeFromUrl,
  );
  globalState.developerModeFromUrl.set(developerModeFromUrl);
  globalState.favoriteEmojiKeys.replace(favoriteEmojiKeys);
  globalState.copiedEmojiKeys.replace(copiedEmojiKeys);
}
