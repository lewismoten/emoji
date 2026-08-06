import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../src/explorer-audio.js";

describe("explorer-audio", () => {
  it("exports controller and dependency factory functions", () => {
    assert.equal(typeof createExplorerAudioController, "function");
    assert.equal(typeof createExplorerAudioDependencies, "function");
  });
});
