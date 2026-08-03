import assert from "node:assert/strict";
import { renderThemeToggle } from "../src/render-theme-toggle.js";

assert.equal(typeof renderThemeToggle, "function");
assert.doesNotThrow(() =>
  renderThemeToggle({
    choices: () => [],
    state: () => ({
      developerModeFromUrl: false,
      developerModeUrlDismissed: false,
      explorerModeFromUrl: "",
    }),
  }),
);
