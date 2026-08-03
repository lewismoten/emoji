import * as preferences from "./preferences.js";

export type ExplorerMode = "standard" | "advanced" | "developer";

const resolveExplorerMode = (state: {
  explorerModeFromUrl?: ExplorerMode;
  developerModeUrlDismissed: boolean;
}): ExplorerMode => {
  if (state.explorerModeFromUrl && !state.developerModeUrlDismissed) {
    return state.explorerModeFromUrl;
  }
  const mode = preferences.getString("mode");
  switch (mode) {
    case "standard":
    case "advanced":
    case "developer":
      return mode;
    default:
      return "standard";
  }
};

export default resolveExplorerMode;
