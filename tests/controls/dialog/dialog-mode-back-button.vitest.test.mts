import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  DialogModeBackButtonControl,
  dialogModeBackButtonClassName,
} from "../../../src/controls/dialog/dialog-mode-back-button.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("dialog-mode-back-button", () => {
  it("renders back buttons with defaults and custom classes", () => {
    const markup = DialogModeBackButtonControl.toMarkup({
      ariaLabel: "Back to emoji details",
      i18nAriaLabel: "pixelEditorBack",
      i18nKey: "pixelEditorBack",
      text: "Back",
    });

    assert.match(markup, /^<button /);
    assert.match(markup, /class="dialog-mode-back"/);
    assert.match(markup, /type="button"/);
    assert.match(markup, /aria-label="Back to emoji details"/);
    assert.match(markup, /data-i18n-aria-label="pixelEditorBack"/);
    assert.match(markup, /data-i18n="pixelEditorBack"/);
    assert.match(markup, />Back<\/button>$/);

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement; body: FakeElement };
    };

    try {
      const button = new DialogModeBackButtonControl({
        ariaLabel: "Back to favorites",
        buttonClassName: "dialog-mode-back custom-back",
        hidden: true,
        text: "Back",
      }).create() as unknown as FakeElement;

      assert.equal(globals.document.head.children.length, 1);
      assert.equal(button.tagName, "BUTTON");
      assert.equal(button.className, "dialog-mode-back custom-back");
      assert.equal(button.type, "button");
      assert.equal(button.getAttribute("hidden"), "hidden");
      assert.equal(button.getAttribute("aria-label"), "Back to favorites");

      const defaultSpec = DialogModeBackButtonControl.toSpec({
        ariaLabel: "Back",
        text: "Back",
      });
      assert.equal(defaultSpec.className, dialogModeBackButtonClassName);
    } finally {
      restore();
    }
  });
});
