import { ensurePanelDialogLifecycleBound } from "./ensure-panel-dialog-lifecycle-bound";
import { getPanelDialog } from "./pwa-get-panel-dialog";
import { BindPanelDialogOptions } from "./pwa-types";

export const bindPanelDialog =(options: BindPanelDialogOptions) => {
  const resolveDialogs = () => options.getDialogs?.() ?? options.dialogs;
  const resolveDialog = () =>
    options.getDialog?.() ??
    options.dialog ??
    getPanelDialog(options.panel, resolveDialogs());

  ensurePanelDialogLifecycleBound({
    applyingUrlState: options.applyingUrlState,
    dialog: resolveDialog(),
    onAfterClose: options.onAfterClose,
    panel: options.panel,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });

  options.button?.addEventListener("click", async () => {
    options.onBeforeOpen?.();
    await options.ensureDialog?.();
    const dialogs = resolveDialogs();
    const dialog = resolveDialog();
    ensurePanelDialogLifecycleBound({
      applyingUrlState: options.applyingUrlState,
      dialog,
      onAfterClose: options.onAfterClose,
      panel: options.panel,
      suppressedPanelCloses: options.suppressedPanelCloses,
      syncUrlState: options.syncUrlState,
      urlStateReady: options.urlStateReady,
    });
    if (!dialogs) return;
    options.openPanel({
      panel: options.panel,
      dialogs,
      languageList: options.getLanguageList?.() ?? options.languageList,
      renderSavedEmoji: options.renderSavedEmoji,
      syncUrlState: options.syncUrlState,
    });
    await options.onAfterOpen?.();
  });
}
