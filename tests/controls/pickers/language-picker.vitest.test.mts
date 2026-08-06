import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { LanguagePickerControl } from "../../../src/controls/pickers/language-picker.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("language-picker", () => {
  it("renders markup and document-backed picker buttons", () => {
    const markup = LanguagePickerControl.toMarkup({
      accessibleLabel: "Choose language",
      accessibleLabelId: "language-picker-accessible-label",
      controlsId: "language-dialog",
      flag: "🇺🇸",
      label: "English",
      labelId: "language-picker-current-label",
    });

    assert.match(markup, /^<button /);
    assert.match(markup, /class="language-picker"/);
    assert.match(markup, /aria-controls="language-dialog"/);
    assert.match(markup, /aria-haspopup="dialog"/);
    assert.match(markup, /aria-label="Choose language"/);
    assert.match(
      markup,
      /aria-labelledby="language-picker-accessible-label language-picker-current-label"/,
    );
    assert.match(
      markup,
      /class="sr-only" id="language-picker-accessible-label" data-i18n="chooseLanguage"/,
    );
    assert.match(
      markup,
      /class="language-picker-flag" aria-hidden="true">🇺🇸<\/span>/,
    );
    assert.match(
      markup,
      /class="language-picker-label" id="language-picker-current-label" data-i18n="language"/,
    );

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement };
    };

    try {
      const button = new LanguagePickerControl({
        accessibleLabel: "Choose language",
        accessibleLabelId: "picker-accessible",
        buttonClassName: "language-picker help-language-control",
        controlsId: "language-dialog",
        flag: "🇪🇸",
        label: "Español",
        labelId: "picker-label",
      }).create() as unknown as FakeElement;

      assert.equal(globals.document.head.children.length, 1);
      assert.equal(
        (globals.document.head.children[0] as FakeElement).id,
        "language-picker-control-style",
      );
      assert.equal(button.tagName, "BUTTON");
      assert.equal(button.className, "language-picker help-language-control");
      assert.equal(button.getAttribute("aria-controls"), "language-dialog");
      assert.equal(button.getAttribute("aria-label"), "Choose language");
    } finally {
      restore();
    }
  });
});
