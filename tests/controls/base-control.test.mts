import assert from "node:assert/strict";

import { BaseControl } from "../../src/controls/base-control.js";
import type { NodeSpec } from "../../src/controls/dom-factory.js";
import { FakeElement, installFakeDocument } from "./fake-dom.mjs";

class ExampleControl extends BaseControl<{
  label: string;
  i18nKey?: string;
}> {
  constructor(state = { label: "Alpha", i18nKey: "alpha" }) {
    super(state);
  }

  protected render(): NodeSpec {
    return {
      tag: "span",
      dataset: this.state.i18nKey ? { i18n: this.state.i18nKey } : undefined,
      requireI18n: Boolean(this.state.i18nKey),
      text: this.state.label,
    };
  }
}

const restore = installFakeDocument();

const instance = new ExampleControl();
instance.update({ label: "Beta" });
const element = instance.create() as unknown as FakeElement;
assert.equal(element.tagName, "SPAN");
assert.equal(element.dataset.i18n, "alpha");
assert.equal(element.textContent, "Beta");

assert.equal(instance.toMarkup(), '<span data-i18n="alpha">Beta</span>');

const staticElement = ExampleControl.create({
  i18nKey: "gamma",
  label: "Gamma",
}) as unknown as FakeElement;
assert.equal(staticElement.textContent, "Gamma");
assert.equal(staticElement.dataset.i18n, "gamma");

assert.equal(
  ExampleControl.toMarkup({
    i18nKey: "delta",
    label: "Delta",
  }),
  '<span data-i18n="delta">Delta</span>',
);

restore();
