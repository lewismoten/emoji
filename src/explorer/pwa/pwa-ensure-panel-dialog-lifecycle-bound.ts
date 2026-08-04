import { onPanelDialogClose } from "./pwa-on-panel-dialog-close.js";
import type { EnsurePanelDialogLifecycleBoundOptions } from "./pwa-types.js";

export const ensurePanelDialogLifecycleBound = (
  options: EnsurePanelDialogLifecycleBoundOptions,
) => {
  const dialog = options.dialog;
  if (!dialog) return;

  const clearPanelParam = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("panel") !== options.panel) return;
    params.delete("panel");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  const markPanelClosing = () => {
    if (dialog.dataset) dialog.dataset.panelClosing = "true";
  };

  const closeButton = dialog.querySelector<HTMLElement>(".dialog-close");
  if (closeButton && closeButton.dataset.panelDismissBound !== "true") {
    closeButton.dataset.panelDismissBound = "true";
    const handleDismiss = () => {
      markPanelClosing();
      clearPanelParam();
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(clearPanelParam);
        return;
      }
      clearPanelParam();
    };
    closeButton.addEventListener("click", handleDismiss);
    closeButton.closest("form")?.addEventListener("submit", handleDismiss);
  }

  if (dialog.dataset.panelCloseBound === "true") return;
  dialog.dataset.panelCloseBound = "true";
  dialog.addEventListener("close", (event: Event) => {
    onPanelDialogClose({
      event,
      suppressedPanelCloses: options.suppressedPanelCloses,
      urlStateReady: options.urlStateReady(),
      applyingUrlState: options.applyingUrlState(),
      syncUrlState: options.syncUrlState,
    });
    options.onAfterClose?.();
  });
};
