import {
  finalizeExplorerStartup as finalizeExplorerStartupHelper,
  initializeExplorerControls as initializeExplorerControlsHelper,
} from "./explorer/control-startup.js";
export { createExplorerApp } from "./app/explorer-app-lifecycle.js";
export { bindExplorerEvents } from "./app/explorer-app-events.js";

/** Create the dynamic filter controls after the static page has loaded. */
export function initializeExplorerControls(options: any) {
  return initializeExplorerControlsHelper(options);
}

/** Complete the asynchronous page startup once controls and events exist. */
export async function finalizeExplorerStartup(options: any) {
  await finalizeExplorerStartupHelper(options);
}
