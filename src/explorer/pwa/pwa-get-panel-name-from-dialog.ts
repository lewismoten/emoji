import type { PanelName } from "./pwa-types.js";

export const getPanelNameFromDialog = (
  dialog: HTMLDialogElement | null,
): PanelName => {
  const classList = dialog?.classList;
  if (!classList || typeof classList.contains !== "function") return "";
  if (classList.contains("saved-dialog")) return "favorites";
  if (classList.contains("help-dialog")) return "help";
  if (classList.contains("language-dialog")) return "language";
  if (classList.contains("advanced-filters-dialog")) return "filters";
  return "";
}