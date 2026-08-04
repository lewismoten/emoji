import { getPanelNameFromDialog } from "./pwa-get-panel-name-from-dialog";
import { ClosePanelOptions } from "./pwa-types";

export const onPanelDialogClose = (options: ClosePanelOptions)  =>{
  const {
  applyingUrlState,
  event,
  suppressedPanelCloses,
  syncUrlState,
  urlStateReady,
} = options;
  const dialog = event.currentTarget as HTMLDialogElement | null;
  if (
    (dialog && suppressedPanelCloses.delete(dialog)) ||
    !urlStateReady ||
    applyingUrlState
  )
    return;
  if (dialog?.dataset) dialog.dataset.panelClosing = "true";
  const closingPanel = getPanelNameFromDialog(dialog);
  const syncAfterClose = () => {
    if (window.history.state?.panelDialogEntry) {
      const nextState =
        window.history.state &&
        typeof window.history.state === "object" &&
        !Array.isArray(window.history.state)
          ? { ...window.history.state }
          : {};
      delete nextState.panelDialogEntry;
      syncUrlState("replace", nextState);
    } else {
      syncUrlState();
    }
    if (typeof window !== "undefined" && closingPanel) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("panel") === closingPanel) {
        params.delete("panel");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }
    if (dialog?.dataset) delete dialog.dataset.panelClosing;
  };
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(syncAfterClose);
    return;
  }
  syncAfterClose();
}
