import assert from "node:assert/strict";

import { unique } from "../../src/utils/lists.js";

assert.deepEqual(unique("dialog", undefined, "dialog", "musical"), [
  "dialog",
  "musical",
]);
assert.deepEqual(unique<number>(1, 2, 1, undefined, 3), [1, 2, 3]);
