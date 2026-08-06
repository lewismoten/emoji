import assert from "node:assert/strict";
import { describe, it } from "vitest";

import * as navigationTypes from "../../../src/explorer/navigation/explorer-navigation-types.js";

describe("explorer-navigation-types", () => {
  it("does not export runtime values", () => {
    assert.deepEqual(Object.keys(navigationTypes), []);
  });
});
