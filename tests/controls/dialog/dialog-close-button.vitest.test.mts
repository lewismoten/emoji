import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  DialogCloseButtonControl,
  dialogCloseButtonAriaKey,
  dialogCloseButtonClassName,
  dialogCloseButtonLabel,
  dialogCloseButtonStyleId,
  dialogCloseButtonStyleText,
  dialogCloseButtonText,
} from "../../../src/controls/dialog/dialog-close-button.js";
import { DomFactory } from "../../../src/controls/core/dom-factory.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("dialog-close-button", () => {
  it("renders close button markup, styles, and validation behavior", () => {
    const restore = installFakeDocument();
    const documentRef = (
      globalThis as typeof globalThis & {
        document: {
          head: FakeElement & { children: FakeElement[] };
        };
      }
    ).document;

    try {
      const closeForm = DialogCloseButtonControl.create() as unknown as FakeElement;
      const styles = (documentRef.head.children as FakeElement[]).filter(
        (child) => child.tagName === "STYLE",
      );
      assert.equal(styles.length, 1);
      assert.equal(styles[0]?.id, dialogCloseButtonStyleId);
      assert.equal(styles[0]?.textContent, dialogCloseButtonStyleText);
      assert.equal(closeForm.tagName, "FORM");
      assert.equal(closeForm.method, "dialog");
      assert.equal(closeForm.children.length, 1);

      const closeButton = closeForm.children[0] as FakeElement;
      assert.equal(closeButton.tagName, "BUTTON");
      assert.equal(closeButton.className, dialogCloseButtonClassName);
      assert.equal(closeButton.type, "submit");
      assert.equal(closeButton.dataset.i18nAriaLabel, dialogCloseButtonAriaKey);
      assert.equal(closeButton.getAttribute("aria-label"), dialogCloseButtonLabel);
      assert.equal(closeButton.textContent, dialogCloseButtonText);
      const closeMarkup = DialogCloseButtonControl.toMarkup();
      assert.match(closeMarkup, /^<form method="dialog"><button /);
      assert.match(closeMarkup, /class="dialog-close"/);
      assert.match(closeMarkup, /type="submit"/);
      assert.match(closeMarkup, /data-i18n-aria-label="close"/);
      assert.match(closeMarkup, /aria-label="Close"/);
      assert.match(closeMarkup, />×<\/button><\/form>$/);

      const customMarkup = new DialogCloseButtonControl({
        buttonClassName: "dialog-close custom-close",
      }).toMarkup();
      assert.match(customMarkup, /class="dialog-close custom-close"/);
      assert.match(customMarkup, /type="submit"/);
      assert.match(customMarkup, /data-i18n-aria-label="close"/);
      assert.match(customMarkup, /aria-label="Close"/);

      DialogCloseButtonControl.create();
      const duplicateStylesheets = (
        documentRef.head.children as FakeElement[]
      ).filter((child) => child.tagName === "STYLE");
      assert.equal(duplicateStylesheets.length, 1);

      assert.throws(
        () =>
          DomFactory.toMarkup(
            DomFactory.button({
              text: "Broken",
              requireI18n: true,
            }),
          ),
        /Missing i18n metadata/,
      );

      assert.throws(
        () =>
          DomFactory.toMarkup({
            tag: "button",
            text: "Broken",
            requireAriaLabel: true,
          }),
        /Missing aria-label metadata/,
      );

      const plainButtonMarkup = DomFactory.toMarkup(
        DomFactory.button({
          attributes: { "aria-label": "Plain button", type: "button" },
          requireI18n: false,
          text: "Plain",
        }),
      );
      assert.match(plainButtonMarkup, /^<button /);
      assert.match(plainButtonMarkup, /type="button"/);
      assert.match(plainButtonMarkup, /aria-label="Plain button"/);
      assert.match(plainButtonMarkup, />Plain<\/button>$/);
    } finally {
      restore();
    }
  });
});
