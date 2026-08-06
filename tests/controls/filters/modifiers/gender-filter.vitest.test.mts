import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { GenderFilterControl } from "../../../../src/controls/filters/modifiers/gender-filter.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

describe("gender-filter", () => {
  it("renders the gender modifier filter and injects shared styles", () => {
    const markup = GenderFilterControl.toMarkup();

    assert.ok(
      markup.includes(
        '<fieldset class="modifier-filter gender-filter" data-max-selectable="1" data-min-selectable="0">',
      ),
    );
    assert.ok(
      markup.includes(
        '<legend id="gender-group-label" data-i18n="gender">Gender</legend>',
      ),
    );
    assert.ok(markup.includes('class="gender"'));
    assert.ok(markup.includes('value="male"'));
    assert.ok(markup.includes('value="female"'));
    assert.ok(markup.includes('value="neutral"'));

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement };
    };

    try {
      GenderFilterControl.create();
      assert.equal(globals.document.head.children.length, 1);
      assert.equal(
        (globals.document.head.children[0] as FakeElement).id,
        "modifier-filter-control-style",
      );
    } finally {
      restore();
    }
  });
});
