import assert from "node:assert/strict";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../src/explorer-audio.js";

assert.equal(typeof createExplorerAudioController, "function");
assert.equal(typeof createExplorerAudioDependencies, "function");
