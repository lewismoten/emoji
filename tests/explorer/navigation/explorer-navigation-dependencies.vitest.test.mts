import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createExplorerNavigationDependencies } from "../../../src/explorer/navigation/explorer-navigation-dependencies.js";

describe("explorer-navigation-dependencies", () => {
  it("creates the expected navigation helper dependencies", () => {
    const dependencies = createExplorerNavigationDependencies();

    assert.equal(typeof dependencies.parseExplorerUrlState, "function");
    assert.equal(typeof dependencies.buildExplorerUrlQuery, "function");
  });
});
