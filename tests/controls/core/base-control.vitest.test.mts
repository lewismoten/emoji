import assert from "node:assert/strict";
import { describe, it } from "vitest";

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
  protected override styles() {
    return [{ id: "child-style", text: ".child {}" }];
  }

  protected render(): NodeSpec {
    return { tag: "span", text: this.state.label };
  }
}

class AssetParentControl extends BaseControl<{ label: string }> {
  exposeAttachAssets() {
    this.attachAssets();
  }

  protected override styles() {
    return [{ id: "parent-style", text: ".parent {}" }];
  }

  protected override childControls() {
    return [new AssetChildControl({ label: "Child" })];
  }

  protected render(): NodeSpec {
    return { tag: "div", text: this.state.label };
  }
}

class StylesheetControl extends BaseControl<{ label: string }> {
  protected override stylesheets() {
    return [{ href: "./control.css", id: "stylesheet-control" }];
  }

  protected render(): NodeSpec {
    return { tag: "div", text: this.state.label };
  }
}

class MinimalControl extends BaseControl<{ label: string }> {
  exposeAttachAssets() {
    this.attachAssets();
  }

  protected render(): NodeSpec {
    return { tag: "div", text: this.state.label };
  }
}

describe("base-control", () => {
  it("renders controls and attaches styles and stylesheets safely", () => {
    const restore = installFakeDocument();
    const documentRef = (
      globalThis as typeof globalThis & { document: { head: FakeElement } }
    ).document;
    const originalDocument = (
      globalThis as typeof globalThis & { document?: any }
    ).document;

    try {
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
      assert.equal(
        (documentRef.head.children[0] as FakeElement).id,
        "parent-style",
      );
      assert.equal(
        (documentRef.head.children[1] as FakeElement).id,
        "child-style",
      );
      assert.equal(
        (documentRef.head.children[0] as FakeElement).textContent,
        ".parent {}",
      );
      new AssetParentControl({ label: "Explicit assets" }).exposeAttachAssets();

      const createWithDocumentElement = instance.createWithDocument(
        documentRef as unknown as { createElement(tagName: string): any },
      ) as unknown as FakeElement;
      assert.equal(createWithDocumentElement.tagName, "SPAN");

      const staticCreateWithDocument = ExampleControl.createWithDocument(
        documentRef as unknown as { createElement(tagName: string): any },
        { i18nKey: "epsilon", label: "Epsilon" },
      ) as unknown as FakeElement;
      assert.equal(staticCreateWithDocument.textContent, "Epsilon");

      const noAssetElement = new MinimalControl({ label: "Plain" }).create();
      assert.equal(
        (noAssetElement as unknown as FakeElement).textContent,
        "Plain",
      );

      const appendChildStylesheetChildren: FakeElement[] = [];
      (globalThis as typeof globalThis & { document: any }).document = {
        createElement(tagName: string) {
          return new FakeElement(tagName);
        },
        getElementById() {
          return null;
        },
        head: {
          appendChild(node: FakeElement) {
            appendChildStylesheetChildren.push(node);
          },
        },
      };
      new StylesheetControl({ label: "Linked appendChild" }).create();
      assert.equal(appendChildStylesheetChildren[0]?.id, "stylesheet-control");
      assert.equal(appendChildStylesheetChildren[0]?.rel, "stylesheet");
      assert.equal(appendChildStylesheetChildren[0]?.href, "./control.css");
      (globalThis as typeof globalThis & { document: any }).document =
        originalDocument;

      const fallbackHeadChildren: FakeElement[] = [];
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

      new StylesheetControl({ label: "Linked" }).create();
      assert.equal(fallbackHeadChildren[2]?.id, "stylesheet-control");
      assert.equal(fallbackHeadChildren[2]?.rel, "stylesheet");
      assert.equal(fallbackHeadChildren[2]?.href, "./control.css");
      (globalThis as typeof globalThis & { document: any }).document =
        originalDocument;

      const existingChildren: FakeElement[] = [];
      (globalThis as typeof globalThis & { document: any }).document = {
        createElement(tagName: string) {
          return new FakeElement(tagName);
        },
        getElementById(id: string) {
          return id === "parent-style" || id === "stylesheet-control"
            ? { id }
            : null;
        },
        head: {
          appendChild(node: FakeElement) {
            existingChildren.push(node);
          },
        },
      };
      new AssetParentControl({ label: "Existing style" }).create();
      new StylesheetControl({ label: "Existing stylesheet" }).create();
      assert.equal(existingChildren.length, 1);
      assert.equal(existingChildren[0]?.id, "child-style");
      (globalThis as typeof globalThis & { document: any }).document =
        originalDocument;

      (globalThis as typeof globalThis & { document: any }).document = {
        createElement(tagName: string) {
          return new FakeElement(tagName);
        },
        getElementById() {
          return null;
        },
      };
      assert.doesNotThrow(() =>
        new AssetParentControl({
          label: "No head available",
        }).exposeAttachAssets(),
      );
      assert.doesNotThrow(() =>
        new StylesheetControl({ label: "No head available" }).create(),
      );
      (globalThis as typeof globalThis & { document: any }).document =
        originalDocument;

      Reflect.deleteProperty(globalThis, "document");
      assert.doesNotThrow(() =>
        new MinimalControl({ label: "NoDoc" }).exposeAttachAssets(),
      );
      (globalThis as typeof globalThis & { document: any }).document =
        originalDocument;
    } finally {
      restore();
    }
  });
});
