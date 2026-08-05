import assert from "node:assert/strict";
import * as wireUp from "../../../src/app/emoji/emoji-wire-up.js";

const createTarget = () => {
  const added: Array<[string, unknown]> = [];
  const removed: Array<[string, unknown]> = [];
  return {
    addEventListener(type: string, handler: unknown) {
      added.push([type, handler]);
    },
    removeEventListener(type: string, handler: unknown) {
      removed.push([type, handler]);
    },
    added,
    removed,
  };
};

const clickHandler = () => {};
const keyHandler = () => {};

const target = createTarget();
const cleanup = wireUp.bindEvent("click", target, clickHandler);
assert.deepEqual(target.added, [["click", clickHandler]]);
cleanup();
assert.deepEqual(target.removed, [["click", clickHandler]]);

assert.doesNotThrow(() =>
  wireUp.bindEvent("change", undefined, clickHandler)(),
);

const clickTarget = createTarget();
const changeTarget = createTarget();
const inputTarget = createTarget();
const closeTarget = createTarget();
const focusTarget = createTarget();
const keyTarget = createTarget();
const onlineTarget = createTarget();
const offlineTarget = createTarget();

wireUp.click(clickTarget, clickHandler)();
wireUp.change(changeTarget, clickHandler)();
wireUp.input(inputTarget, clickHandler)();
wireUp.close(closeTarget, clickHandler)();
wireUp.focusIn(focusTarget, clickHandler)();
wireUp.keyDown(keyTarget, keyHandler)();
wireUp.online(onlineTarget, clickHandler)();
wireUp.offline(offlineTarget, clickHandler)();

assert.deepEqual(clickTarget.added, [["click", clickHandler]]);
assert.deepEqual(changeTarget.added, [["change", clickHandler]]);
assert.deepEqual(inputTarget.added, [["input", clickHandler]]);
assert.deepEqual(closeTarget.added, [["close", clickHandler]]);
assert.deepEqual(focusTarget.added, [["focusin", clickHandler]]);
assert.deepEqual(keyTarget.added, [["keydown", keyHandler]]);
assert.deepEqual(onlineTarget.added, [["online", clickHandler]]);
assert.deepEqual(offlineTarget.added, [["offline", clickHandler]]);

assert.deepEqual(clickTarget.removed, [["click", clickHandler]]);
assert.deepEqual(changeTarget.removed, [["change", clickHandler]]);
assert.deepEqual(inputTarget.removed, [["input", clickHandler]]);
assert.deepEqual(closeTarget.removed, [["close", clickHandler]]);
assert.deepEqual(focusTarget.removed, [["focusin", clickHandler]]);
assert.deepEqual(keyTarget.removed, [["keydown", keyHandler]]);
assert.deepEqual(onlineTarget.removed, [["online", clickHandler]]);
assert.deepEqual(offlineTarget.removed, [["offline", clickHandler]]);
