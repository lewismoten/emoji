import assert from "node:assert/strict";

import { createModeChoiceGroupControl } from "../../../src/explorer/toolbar/mode-choice-control.js";

const control = createModeChoiceGroupControl();

assert.ok(control);
assert.equal(typeof control.render, "function");
