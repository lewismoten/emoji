import assert from "node:assert/strict";
import { createExplorerNavigationDependencies } from "../../../src/explorer/navigation/explorer-navigation-dependencies.js";

const dependencies = createExplorerNavigationDependencies();

assert.equal(typeof dependencies.parseExplorerUrlState, "function");
assert.equal(typeof dependencies.buildExplorerUrlQuery, "function");
