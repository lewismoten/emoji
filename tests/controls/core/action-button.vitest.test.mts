import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ActionButtonControl } from "../../../src/controls/core/action-button.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("action-button", () => {
  it("renders markup and document-backed elements", () => {
    const markup = ActionButtonControl.toMarkup({
      ariaLabel: "Example action",
      className: "example-action",
      emoji: "⭐",
      emojiClassName: "example-emoji",
      i18nAriaLabel: "exampleAction",
      label: "Do it",
      labelClassName: "example-label",
      labelKey: "doIt",
    });

    assert.match(markup, /^<button /);
    assert.match(markup, /class="example-action"/);
    assert.match(markup, /aria-label="Example action"/);
    assert.match(markup, /data-i18n-aria-label="exampleAction"/);
    assert.match(markup, /class="example-emoji"[^>]*>⭐<\/span>/);
    assert.match(
      markup,
      /class="example-label" data-i18n="doIt">Do it<\/span>/,
    );

    const labelFirstMarkup = ActionButtonControl.toMarkup({
      ariaLabel: "Label first",
      className: "label-first",
      contentOrder: "label-emoji",
      emoji: "🔥",
      label: "Hot",
    });
    assert.match(
      labelFirstMarkup,
      /<button[^>]*><span>Hot<\/span><span aria-hidden="true">🔥<\/span><\/button>/,
    );

    const attributeMarkup = ActionButtonControl.toMarkup({
      ariaLabel: "Attribute action",
      attributes: { disabled: "disabled" },
      children: ["Custom child"],
      className: "attribute-action",
      dataAttributes: { role: "action" },
      title: "Action title",
      type: "submit",
    });
    assert.match(attributeMarkup, /type="submit"/);
    assert.match(attributeMarkup, /title="Action title"/);
    assert.match(attributeMarkup, /disabled="disabled"/);
    assert.match(attributeMarkup, /data-role="action"/);
    assert.match(attributeMarkup, />Custom child<\/button>/);

    const restore = installFakeDocument();
    const documentRef = (
      globalThis as typeof globalThis & {
        document: { createElement(tagName: string): any };
      }
    ).document;

    try {
      const element = ActionButtonControl.createWithDocument(documentRef, {
        ariaLabel: "Document action",
        className: "document-action",
        emoji: "✅",
        emojiTag: "strong",
        label: "Accept",
        labelTag: "em",
      });

      assert.equal((element as unknown as FakeElement).tagName, "BUTTON");
      const firstChild = (element as unknown as FakeElement)
        .children[0] as FakeElement;
      const secondChild = (element as unknown as FakeElement)
        .children[1] as FakeElement;
      assert.equal(firstChild.tagName, "STRONG");
      assert.equal(secondChild.tagName, "EM");
    } finally {
      restore();
    }
  });
});
