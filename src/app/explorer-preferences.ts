import { parseExplorerModeParam } from "../explorer/navigation/url-state.js";
import * as preferences from "../preferences.js";

export function initializeExplorerPreferences(state: any) {
  preferences.init(state);
  state.explorerModeFromUrl = parseExplorerModeParam(window.location.search);
  state.developerModeFromUrl = state.explorerModeFromUrl === "developer";
  state.favoriteEmojiKeys = preferences.getStringArray("favorites");
  state.copiedEmojiKeys = preferences.getStringArray("recentCopied");
}
