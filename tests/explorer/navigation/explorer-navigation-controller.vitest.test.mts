import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createExplorerNavigation } from "../../../src/explorer/navigation/explorer-navigation-controller.js";

describe("explorer-navigation-controller", () => {
  it("exports the navigation controller factory", () => {
    assert.equal(typeof createExplorerNavigation, "function");
  });
});
