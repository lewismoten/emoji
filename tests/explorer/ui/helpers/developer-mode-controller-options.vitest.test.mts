import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  DeveloperModeControllerOptions,
  ExplorerMode,
  ExplorerState,
} from "../../../../src/developer-mode-controller-options.js";

describe("developer-mode-controller-options", () => {
  it("exports the expected helper types", () => {
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
      setDialogView: () => undefined,
      state: () => state,
      syncUrlState: () => undefined,
      toggle: () => ({ checked: true }),
    };

    assert.equal(mode, "developer");
    assert.equal(typeof options.loadVersionData, "function");
  });
});
