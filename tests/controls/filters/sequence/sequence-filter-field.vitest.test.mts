import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { SequenceFilterFieldControl } from "../../../../src/controls/filters/sequence/sequence-filter-field.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

describe("sequence-filter-field", () => {
  it("renders the sequence field markup and default element structure", () => {
    const restore = installFakeDocument();

    try {
      const field =
        SequenceFilterFieldControl.create() as unknown as FakeElement;
      assert.equal(
        field.className,
        "filter-field sequence-filter-field has-choice-buttons",
      );
      assert.equal(field.getAttribute("hidden"), "hidden");
      assert.equal(field.children.length, 3);
      assert.equal(
        (field.children[0] as FakeElement).className,
        "filter-heading",
      );
      assert.equal(
        (
          (field.children[0] as FakeElement).children[0] as FakeElement
        ).getAttribute("id"),
        "sequence-filter-label",
      );
      assert.equal(
        ((field.children[1] as FakeElement).children[0] as FakeElement)
          .textContent,
        "Not loaded",
      );
      assert.equal(
        (field.children[2] as FakeElement).getAttribute("role"),
        "radiogroup",
      );

      const markup = SequenceFilterFieldControl.toMarkup({
        hidden: false,
        label: "Sequences",
        labelId: "seq-label",
        labelKey: "sequenceType",
      });
      assert.match(
        markup,
        /class="filter-field sequence-filter-field has-choice-buttons"/,
      );
      assert.doesNotMatch(markup, /hidden=/);
      assert.match(markup, /id="seq-label"/);
      assert.match(markup, /Sequences/);
    } finally {
      restore();
    }
  });
});
