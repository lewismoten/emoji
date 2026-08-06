import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { renderThemeToggle } from "../../../../src/render-theme-toggle.js";

describe("render-theme-toggle", () => {
  it("exports a render function", () => {
    assert.equal(typeof renderThemeToggle, "function");
  });
});
