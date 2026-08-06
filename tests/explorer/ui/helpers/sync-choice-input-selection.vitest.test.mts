import assert from "node:assert/strict";
import { describe, it } from "vitest";

import syncChoiceInputSelection from "../../../../src/sync-choice-input-selection.js";

describe("sync-choice-input-selection", () => {
  it("keeps the radio input selection state in sync", () => {
    const attributes = new Map<string, string>();
    const input = {
      checked: false,
      defaultChecked: false,
      removeAttribute(name: string) {
        attributes.delete(name);
      },
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
      tabIndex: 0,
    };

    syncChoiceInputSelection(input as any, true);
    assert.equal(input.checked, true);
    assert.equal(input.defaultChecked, true);
    assert.equal(input.tabIndex, -1);
    assert.equal(attributes.get("checked"), "checked");

    syncChoiceInputSelection(input as any, false);
    assert.equal(input.checked, false);
    assert.equal(input.defaultChecked, false);
    assert.equal(attributes.has("checked"), false);
    assert.doesNotThrow(() => syncChoiceInputSelection(null, true));
  });
});
