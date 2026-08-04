import { PanelDialogs, PanelName } from "./pwa-types";

export const getPanelDialog = (panel: PanelName, dialogs?: PanelDialogs): HTMLDialogElement | undefined =>
   panel ? dialogs?.[panel] : undefined;
