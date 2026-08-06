import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { EmojiFontChoiceGroupControl } from "../../../src/controls/toolbar/emoji-font-choice-group.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("emoji-font-choice-group", () => {
  it("renders font choices and exposes its spec", () => {
    const markup = EmojiFontChoiceGroupControl.toMarkup();

    assert.ok(markup.includes('class="pixel-comparison"'));
    assert.ok(markup.includes('data-i18n-aria-label="emojiStyle"'));
    assert.ok(markup.includes('data-emoji-font="system"'));
    assert.ok(markup.includes('data-emoji-font="pixel"'));
    assert.ok(
      markup.includes('class="emoji-font-choice emoji-font-choice-system"'),
    );
    assert.ok(
      markup.includes('class="emoji-font-choice emoji-font-choice-pixel"'),
    );
    assert.ok(markup.includes('class="emoji-font-choice-input"'));
    assert.ok(markup.includes('class="pixel-comparison-system"'));
    assert.ok(markup.includes('class="pixel-comparison-custom"'));
    assert.ok(markup.includes('data-i18n="system">System</small>'));
    assert.ok(markup.includes('data-i18n="pixel">Pixel</small>'));
    assert.ok(markup.includes(">😀</b>"));
    assert.match(markup, /tabindex="-1"[\s\S]*value="system"/);
    assert.match(markup, /tabindex="0"[\s\S]*value="pixel"/);

    const customMarkup = EmojiFontChoiceGroupControl.toMarkup({
      ariaLabel: "Glyph style",
      choices: [
        {
          className: "emoji-font-choice emoji-font-choice-custom",
          font: "custom",
          glyphClassName: "pixel-comparison-custom",
          glyphText: "😎",
          label: "Custom",
          labelKey: "custom",
          selected: true,
          tabIndex: 0,
        },
      ],
    });
    assert.ok(customMarkup.includes('aria-label="Glyph style"'));
    assert.ok(customMarkup.includes('data-emoji-font="custom"'));
    assert.ok(customMarkup.includes(">😎</b>"));

    const spec = EmojiFontChoiceGroupControl.toSpec();
    assert.equal(spec.tag, "div");
    assert.equal(spec.attributes?.role, "radiogroup");

    const restore = installFakeDocument();
    try {
      const control = new EmojiFontChoiceGroupControl();
      assert.match(control.toMarkup(), /emoji-font-choice-system/);
      const element = EmojiFontChoiceGroupControl.create() as unknown as FakeElement;
      assert.equal(element.className, "pixel-comparison");
      assert.equal(element.querySelectorAll(".emoji-font-choice").length, 2);
    } finally {
      restore();
    }
  });
});
