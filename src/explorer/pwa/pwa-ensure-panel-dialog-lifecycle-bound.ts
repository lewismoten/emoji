import { onPanelDialogClose } from "./pwa-on-panel-dialog-close.js";
import type { EnsurePanelDialogLifecycleBoundOptions } from "./pwa-types.js";
import * as route from '../../app/route.js';

export const ensurePanelDialogLifecycleBound = (
  options: EnsurePanelDialogLifecycleBoundOptions,
) => {
  const dialog = options.dialog;
  if (!dialog) return;

  const clearPanelParam = () => {
    if (route.getPanel() !== options.panel) return;
    const nextUrl = route.getLocationUrl({ignore: "panel"});
    route.applyHistory("replace", nextUrl);
  };

  const markPanelClosing = () => {
    dialog.dataset.panelClosing = "true";
  };

  const closeButton = dialog.querySelector<HTMLElement>(".dialog-close");
  if (closeButton && closeButton.dataset.panelDismissBound !== "true") {
    closeButton.dataset.panelDismissBound = "true";
    const handleDismiss = () => {
      markPanelClosing();
      clearPanelParam();
      if (typeof window !== "undefined") {
        window.requestAnimationFrame?.(clearPanelParam);
      }
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
