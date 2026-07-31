import assert from "node:assert/strict";

import { installFakeDocument, FakeElement } from "../../controls/fake-dom.mjs";
import {
  createDialogHeading,
  createHeading,
  createTextBlock,
  setPressedState,
} from "../../../src/explorer/dialog/dialog-control-helpers.js";

const restore = installFakeDocument();

const heading = createHeading("h3", "details", "Details") as unknown as FakeElement;
assert.equal(heading.tagName, "H3");
assert.equal(heading.dataset.i18n, "details");
assert.equal(heading.textContent, "Details");

const text = createTextBlock("p", "body", "Body copy") as unknown as FakeElement;
assert.equal(text.tagName, "P");
assert.equal(text.dataset.i18n, "body");
assert.equal(text.textContent, "Body copy");

const dialogHeading = createDialogHeading({
  titleId: "example-title",
  titleKey: "example",
  title: "Example",
  eyebrowKey: "eyebrow",
  eyebrow: "Helper",
}) as unknown as FakeElement;
assert.equal(dialogHeading.className, "dialog-heading");

const toggleTarget = {
  classList: {
    toggled: [] as Array<[string, boolean]>,
    toggle(name: string, selected: boolean) {
      this.toggled.push([name, selected]);
    },
  },
  attributes: new Map<string, string>(),
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  },
};
setPressedState(toggleTarget, true, "is-active");
assert.deepEqual(toggleTarget.classList.toggled, [["is-active", true]]);
assert.equal(toggleTarget.attributes.get("aria-pressed"), "true");

restore();
