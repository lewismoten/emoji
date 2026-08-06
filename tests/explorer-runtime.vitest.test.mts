import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createExplorerRuntime } from "../src/explorer-runtime.js";

describe("explorer-runtime", () => {
  it("resolves, exposes, and labels runtime elements", () => {
    const ensureCalls: string[] = [];
    const languagePicker = {
      attributes: new Map<string, string>(),
      setAttribute(name: string, value: string) {
        this.attributes.set(name, value);
      },
    };
    const elements = {
      emojiList: { id: "emoji-list" },
      languagePicker,
      languagePickerLabel: { id: "" },
    };

    const runtime = createExplorerRuntime({
      ensureUtilityControls() {
        ensureCalls.push("ensureUtilityControls");
      },
      getElements() {
        ensureCalls.push("getElements");
        return elements;
      },
    });

    assert.throws(() => runtime.all(), /has not been initialized/);
    assert.equal(runtime.get("emojiList"), undefined);

    const resolved = runtime.resolveElements();
    assert.equal(resolved, elements);
    assert.deepEqual(ensureCalls, ["ensureUtilityControls", "getElements"]);
    assert.equal(elements.languagePickerLabel.id, "language-picker-current-label");
    assert.equal(
      languagePicker.attributes.get("aria-labelledby"),
      "language-picker-accessible-label language-picker-current-label",
    );
    assert.equal(runtime.get("emojiList"), elements.emojiList);
    assert.equal(runtime.all(), elements);
  });

  it("preserves an existing language picker label id", () => {
    const preLabeled = {
      languagePicker: {
        attributes: new Map<string, string>(),
        setAttribute(name: string, value: string) {
          this.attributes.set(name, value);
        },
      },
      languagePickerLabel: { id: "custom-label" },
    };

    createExplorerRuntime({
      ensureUtilityControls() {},
      getElements() {
        return preLabeled;
      },
    }).resolveElements();

    assert.equal(preLabeled.languagePickerLabel.id, "custom-label");
    assert.equal(
      preLabeled.languagePicker.attributes.get("aria-labelledby"),
      "language-picker-accessible-label custom-label",
    );
  });
});
