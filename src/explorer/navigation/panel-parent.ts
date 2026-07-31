type PanelDialogsLike = {
  language?: { dataset?: Record<string, string | undefined> };
};

type PanelName = "" | "favorites" | "help" | "language" | "filters";

export function applyLanguagePanelParent(
  dialogs: PanelDialogsLike,
  panel: PanelName,
  panelParent?: "help",
) {
  const languageDialog = dialogs.language;
  if (!languageDialog?.dataset) return;
  if (panel === "language" && panelParent) {
    languageDialog.dataset.returnPanel = panelParent;
    return;
  }
  delete languageDialog.dataset.returnPanel;
}

export function getLanguagePanelParent(
  dialogs: PanelDialogsLike,
  openPanel: PanelName,
) {
  return openPanel === "language" &&
    dialogs.language?.dataset?.returnPanel === "help"
    ? "help"
    : "";
}
