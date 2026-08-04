import { getPanelNameFromDialog } from "./pwa-get-panel-name-from-dialog.js";
import type { ClosePanelOptions } from "./pwa-types.js";
import * as route from '../../app/route.js';

export const onPanelDialogClose = (options: ClosePanelOptions) => {
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
      if (route.getPanel() === closingPanel) {
        const nextUrl = route.getLocationUrl({ignore: "panel"})
        route.applyHistory("replace", nextUrl);
      }
    }
    if (dialog?.dataset) delete dialog.dataset.panelClosing;
  };
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(syncAfterClose);
    return;
  }
  syncAfterClose();
};
