import assert from "node:assert/strict";
import { createExplorerNavigation } from "../../../src/explorer/navigation/explorer-navigation-controller.js";

assert.equal(typeof createExplorerNavigation, "function");
