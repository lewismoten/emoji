import type { PanelDialogs, PanelName } from "./pwa-types.js";

export const getPanelDialog = (
  panel: PanelName,
  dialogs?: PanelDialogs,
): HTMLDialogElement | undefined => (panel ? dialogs?.[panel] : undefined);
