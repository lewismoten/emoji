import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { FilterPickerDialogControl } from "../../../../src/controls/filters/pickers/filter-picker-dialog.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

describe("filter-picker-dialog", () => {
  it("renders dialog markup, specs, and document-backed dialogs", () => {
    const markup = FilterPickerDialogControl.toMarkup({
      choicesClassName: "compact-group-choices",
      className: "filter-picker-dialog group-filter-dialog",
      dialogId: "group-filter-dialog",
      title: "Choose a group",
      titleId: "group-filter-dialog-title",
      titleKey: "chooseGroup",
    });

    assert.match(markup, /^<dialog /);
    assert.match(
      markup,
      /class="dialog filter-picker-dialog group-filter-dialog"/,
    );
    assert.match(markup, /id="group-filter-dialog"/);
    assert.match(markup, /aria-labelledby="group-filter-dialog-title"/);
    assert.match(markup, /data-i18n="chooseGroup">Choose a group</);
    assert.match(
      markup,
      /class="compact-choices compact-group-choices" aria-labelledby="group-filter-dialog-title" role="radiogroup"/,
    );

    const spec = FilterPickerDialogControl.toSpec({
      choicesClassName: "compact-group-choices",
      className: "filter-picker-dialog group-filter-dialog",
      dialogId: "group-filter-dialog",
      title: "Choose a group",
      titleId: "group-filter-dialog-title",
      titleKey: "chooseGroup",
    });
    assert.equal(spec.tag, "dialog");
    assert.equal(spec.attributes?.id, "group-filter-dialog");

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement };
    };

    try {
      const instance = new FilterPickerDialogControl({
        choicesClassName: "compact-subgroup-choices",
        className: "filter-picker-dialog subgroup-filter-dialog",
        dialogId: "subgroup-filter-dialog",
        title: "Choose a sub-group",
        titleId: "subgroup-filter-dialog-title",
        titleKey: "chooseSubgroup",
      });
      assert.match(instance.toMarkup(), /compact-subgroup-choices/);
      const dialog = FilterPickerDialogControl.create({
        choicesClassName: "compact-subgroup-choices",
        className: "filter-picker-dialog subgroup-filter-dialog",
        dialogId: "subgroup-filter-dialog",
        title: "Choose a sub-group",
        titleId: "subgroup-filter-dialog-title",
        titleKey: "chooseSubgroup",
      }) as unknown as FakeElement;

      assert.equal(globals.document.head.children.length, 2);
      assert.equal(dialog.tagName, "DIALOG");
      assert.equal(
        dialog.className,
        "dialog filter-picker-dialog subgroup-filter-dialog",
      );
      assert.equal(dialog.getAttribute("id"), "subgroup-filter-dialog");
      assert.equal(dialog.children.length, 2);
      assert.equal(
        (dialog.querySelector(".compact-subgroup-choices") as FakeElement)
          .tagName,
        "DIV",
      );
    } finally {
      restore();
    }
  });
});
