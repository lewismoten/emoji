import assert from "node:assert/strict";

import { BaseControl } from "../../../src/controls/core/base-control.js";
import type { NodeSpec } from "../../../src/controls/core/dom-factory.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

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

class AssetChildControl extends BaseControl<{ label: string }> {
  protected override stylesheets() {
    return [{ href: "/child.css", id: "child-style" }];
  }

  protected render(): NodeSpec {
    return { tag: "span", text: this.state.label };
  }
}

class AssetParentControl extends BaseControl<{ label: string }> {
  protected override stylesheets() {
    return [{ href: "/parent.css", id: "parent-style" }];
  }

  protected override childControls() {
    return [new AssetChildControl({ label: "Child" })];
  }

  protected render(): NodeSpec {
    return { tag: "div", text: this.state.label };
  }
}

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & { document: { head: FakeElement } }
).document;

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

const assetElement = new AssetParentControl({
  label: "Parent",
}).create() as unknown as FakeElement;
assert.equal(assetElement.tagName, "DIV");
assert.equal(documentRef.head.children.length, 2);
assert.equal((documentRef.head.children[0] as FakeElement).id, "parent-style");
assert.equal((documentRef.head.children[1] as FakeElement).id, "child-style");

const fallbackHeadChildren: FakeElement[] = [];
const originalDocument = (globalThis as typeof globalThis & { document?: any })
  .document;
(globalThis as typeof globalThis & { document: any }).document = {
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
  getElementById() {
    return null;
  },
  head: {
    append(node: FakeElement) {
      fallbackHeadChildren.push(node);
    },
  },
};
new AssetParentControl({ label: "Fallback" }).create();
assert.equal(fallbackHeadChildren.length, 2);
(globalThis as typeof globalThis & { document: any }).document =
  originalDocument;

restore();
