import assert from "node:assert/strict";
import type {
  DeveloperModeControllerOptions,
  ExplorerMode,
  ExplorerState,
} from "../src/developer-mode-controller-options.js";

const state: ExplorerState = {
  developerModeFromUrl: false,
  developerModeUrlDismissed: false,
  explorerModeFromUrl: "advanced",
};

const mode: ExplorerMode = "developer";
const options: DeveloperModeControllerOptions = {
  choices: () => [],
  dialog: () => undefined,
  disableDeveloperFeatures: () => undefined,
  loadVersionData: () => undefined,
  renderThemeToggle: () => undefined,
  setDialogView: () => undefined,
  state: () => state,
  syncUrlState: () => undefined,
  toggle: () => ({ checked: true }),
};

assert.equal(mode, "developer");
assert.equal(options.state().explorerModeFromUrl, "advanced");
assert.equal(typeof options.loadVersionData, "function");
