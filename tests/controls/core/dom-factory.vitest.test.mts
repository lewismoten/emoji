import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { DomFactory } from "../../../src/controls/core/dom-factory.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("dom-factory", () => {
  it("creates element specs, DOM nodes, and markup", () => {
    const restore = installFakeDocument();

    try {
      const spec = DomFactory.element("div", {
        attributes: { role: "status" },
        children: [
          DomFactory.element("span", {
            dataset: { i18n: "helloLabel" },
            requireI18n: true,
            text: "Hello",
          }),
          " world",
        ],
        className: "example",
        dataset: { panelId: "helpDialog" },
      });

      const element = DomFactory.createElement(spec) as unknown as FakeElement;
      assert.equal(element.tagName, "DIV");
      assert.equal(element.className, "example");
      assert.equal(element.getAttribute("role"), "status");
      assert.equal(element.dataset.panelId, "helpDialog");
      assert.equal(
        (element.children[0] as FakeElement).dataset.i18n,
        "helloLabel",
      );

      assert.equal(
        DomFactory.toMarkup(spec),
        '<div class="example" role="status" data-panel-id="helpDialog"><span data-i18n="helloLabel">Hello</span> world</div>',
      );

      assert.deepEqual(
        DomFactory.button({ text: "X", attributes: { "aria-label": "Close" } }),
        {
          tag: "button",
          text: "X",
          attributes: { "aria-label": "Close" },
          requireAriaLabel: true,
        },
      );

      assert.deepEqual(DomFactory.form(), { tag: "form" });

      assert.throws(
        () =>
          DomFactory.toMarkup({
            tag: "button",
            text: "Oops",
          }),
        /Missing aria-label metadata/,
      );

      assert.throws(
        () =>
          DomFactory.toMarkup({
            tag: "span",
            requireI18n: true,
            text: "Oops",
          }),
        /Missing i18n metadata/,
      );

      assert.equal(
        DomFactory.toMarkup(
          DomFactory.element("span", {
            text: '<&">',
          }),
        ),
        "<span>&lt;&amp;&quot;&gt;</span>",
      );
    } finally {
      restore();
    }
  });
});
