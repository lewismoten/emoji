import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  DialogNavigateButtonControl,
  dialogNavigateButtonClassName,
} from "../../../src/controls/dialog/dialog-navigate-button.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

describe("dialog-navigate-button", () => {
  it("renders navigation buttons with defaults and disabled states", () => {
    const markup = DialogNavigateButtonControl.toMarkup({
      ariaLabel: "Next emoji",
      text: "Next",
    });

    assert.match(markup, /^<button /);
    assert.match(markup, /class="dialog-navigate"/);
    assert.match(markup, /type="button"/);
    assert.match(markup, /aria-label="Next emoji"/);
    assert.match(markup, />Next<\/button>$/);

    const restore = installFakeDocument();
    const globals = globalThis as typeof globalThis & {
      document: { head: FakeElement };
    };

    try {
      const button = new DialogNavigateButtonControl({
        ariaLabel: "Previous emoji",
        buttonClassName: "dialog-navigate previous",
        disabled: true,
        hidden: true,
        text: "Prev",
      }).create() as unknown as FakeElement;

      assert.equal(globals.document.head.children.length, 1);
      assert.equal(
        (globals.document.head.children[0] as FakeElement).id,
        "dialog-navigate-button-control-style",
      );
      assert.equal(button.tagName, "BUTTON");
      assert.equal(button.className, "dialog-navigate previous");
      assert.equal(button.type, "button");
      assert.equal(button.getAttribute("disabled"), "disabled");
      assert.equal(button.getAttribute("hidden"), "hidden");
      assert.equal(button.getAttribute("aria-label"), "Previous emoji");

      const defaultSpec = DialogNavigateButtonControl.toSpec({
        ariaLabel: "Next",
        text: "Next",
      });
      assert.equal(defaultSpec.className, dialogNavigateButtonClassName);
    } finally {
      restore();
    }
  });
});
