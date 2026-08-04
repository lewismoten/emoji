import { buildExplorerUrlQuery, parseExplorerUrlState } from "./url-state.js";
import {
  applyBasicUrlStateToControls,
  applyExclusiveCheckboxSelection,
  applyLoadedUrlStateToControls,
  resetFilterControls,
  stepVersionIndex,
} from "../filters/filter-controls.js";
import {
  closePanelDialog,
  ensurePanelDialogLifecycleBound,
  getOpenPanel,
  getPanelDialog,
  openPanelDialog,
} from "../pwa/pwa-panels.js";

export function createExplorerNavigationDependencies() {
  return {
    applyBasicUrlStateToControls,
    applyExclusiveCheckboxSelection,
    applyLoadedUrlStateToControls,
    buildExplorerUrlQuery,
    closePanelDialog,
    ensurePanelDialogLifecycleBound,
    getOpenPanel,
    getPanelDialog,
    openPanelDialog,
    parseExplorerUrlState,
    resetFilterControls,
    stepVersionIndex,
  };
}

export type ExplorerNavigationDependencies = ReturnType<
  typeof createExplorerNavigationDependencies
>;
