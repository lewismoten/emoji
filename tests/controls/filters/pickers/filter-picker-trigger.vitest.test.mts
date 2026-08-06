import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { FilterPickerTriggerControl } from "../../../../src/controls/filters/pickers/filter-picker-trigger.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

describe("filter-picker-trigger", () => {
  it("renders trigger markup and document-backed trigger buttons", () => {
    const markup = FilterPickerTriggerControl.toMarkup({
      controlsId: "group-filter-dialog",
      kind: "Group",
      kindKey: "group",
      triggerClassName: "group-picker-trigger",
      value: "All",
      valueKey: "all",
    });

    assert.match(markup, /^<button /);
    assert.match(markup, /class="filter-picker-trigger group-picker-trigger"/);
    assert.match(markup, /aria-controls="group-filter-dialog"/);
    assert.match(markup, /aria-haspopup="dialog"/);
    assert.match(markup, /aria-label="Group: All"/);
    assert.match(markup, /class="filter-picker-kind sr-only" data-i18n="group"/);
    assert.match(
      markup,
      /class="filter-picker-emoji" aria-hidden="true">🌐<\/span>/,
    );
    assert.match(markup, /class="filter-picker-value" data-i18n="all"/);

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement };
    };

    try {
      const button = new FilterPickerTriggerControl({
        controlsId: "subgroup-filter-dialog",
        kind: "Sub-group",
        kindKey: "subgroup",
        triggerClassName: "subgroup-picker-trigger",
        value: "Hands",
        valueKey: "hands",
      }).create() as unknown as FakeElement;

      assert.equal(globals.document.head.children.length, 1);
      assert.equal(
        (globals.document.head.children[0] as FakeElement).id,
        "filter-picker-trigger-control-style",
      );
      assert.equal(button.tagName, "BUTTON");
      assert.equal(
        button.className,
        "filter-picker-trigger subgroup-picker-trigger",
      );
      assert.equal(button.getAttribute("aria-label"), "Sub-group: Hands");
    } finally {
      restore();
    }
  });
});
