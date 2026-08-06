import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  installUtilityDom,
  loadUtilityControlsModule,
} from "./utility-controls-fixture.mjs";

describe("utility-controls-ensure", () => {
  it("hydrates utility controls into the existing explorer DOM", async () => {
    const dom = installUtilityDom();

    try {
      const { module, pickerStub, advancedStub } =
        await loadUtilityControlsModule();

      module.ensureUtilityControls();

      assert.equal(dom.fontComparison.attributes.get("role"), "radiogroup");
      assert.equal(dom.fontComparison.dataset.i18nAriaLabel, "emojiStyle");
      assert.equal(
        dom.fontComparison.childNodes[0]?.className,
        "emoji-font-choice emoji-font-choice-system",
      );
      assert.equal(
        dom.fontComparison.childNodes[1]?.className,
        "emoji-font-choice emoji-font-choice-pixel",
      );
      assert.equal(
        dom.searchControls.childNodes.some(
          (node) => node?.className === "saved-picker",
        ),
        true,
      );
      assert.equal(
        dom.searchControls.childNodes.some(
          (node) => node?.className === "help-picker",
        ),
        true,
      );
      assert.equal(dom.pixelFontToggle.removed, true);
      assert.deepEqual(pickerStub.calls, ["ensurePickerControls"]);
      assert.deepEqual(advancedStub.calls, []);
    } finally {
      dom.restore();
    }
  });
});
