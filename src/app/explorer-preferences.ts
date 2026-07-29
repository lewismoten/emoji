const preferenceKey = "@lewismoten/emoji:explorer-preferences";

function loadPreferences() {
  try {
    return JSON.parse(window.localStorage.getItem(preferenceKey) ?? "{}");
  } catch {
    return {};
  }
}

/** Initialize and persist Explorer preferences without coupling to the DOM. */
export function initializeExplorerPreferences(state: any) {
  state.explorerPreferences = loadPreferences();
  if (
    !["standard", "advanced", "developer"].includes(
      state.explorerPreferences.mode,
    )
  ) {
    state.explorerPreferences.mode =
      state.explorerPreferences.developerMode === true
        ? "developer"
        : "standard";
  }
  state.developerModeFromUrl =
    new URLSearchParams(window.location.search).get("developer") === "1";
  state.favoriteEmojiKeys = Array.isArray(state.explorerPreferences.favorites)
    ? state.explorerPreferences.favorites
    : [];
  state.copiedEmojiKeys = Array.isArray(state.explorerPreferences.recentCopied)
    ? state.explorerPreferences.recentCopied
    : [];

  const save = (key: string, value: unknown) => {
    state.explorerPreferences[key] = value;
    try {
      window.localStorage.setItem(
        preferenceKey,
        JSON.stringify(state.explorerPreferences),
      );
    } catch {
      // Preferences are optional when storage is unavailable or blocked.
    }
  };

  return { save };
}
