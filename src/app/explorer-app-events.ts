import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  createThemeChoiceKeyDownHandler,
} from "../explorer/navigation/event-accessibility.js";
import { bindPanelDialog } from "../explorer/pwa/pwa-panels.js";
import * as audioToggle from "../controls/audio/audio-toggle.js";
import * as themes from "../utils/themes.js";
import { bindExplorerEventsWithEnvironment } from "./emoji/explorer-app-events-runtime.js";

export function createExplorerAppEventDependencies() {
  return {
    audioToggle,
    bindModifierGroup,
    bindPanelDialog,
    bindSavedDialogInteractions,
    createThemeChoiceKeyDownHandler,
    themes,
  };
}

/** Bind browser events after the Explorer has resolved its DOM references. */
export function bindExplorerEvents(
  options: any,
  dependencies: any = createExplorerAppEventDependencies(),
) {
  const documentRef = typeof document === "undefined" ? undefined : document;
  const windowRef = typeof window === "undefined" ? undefined : window;
  bindExplorerEventsWithEnvironment(
    options,
    {
      ...dependencies,
      createThemeChoiceKeyDownHandler,
    },
    documentRef,
    windowRef,
  );
}
