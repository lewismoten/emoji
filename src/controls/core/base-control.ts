import { DomFactory, type NodeSpec } from "./dom-factory.js";

type ControlDocumentLike = {
  createElement(tagName: string): {
    id: string;
    rel: string;
    href: string;
  };
  getElementById(id: string): unknown;
  head?: {
    append?(node: unknown): void;
    appendChild(node: unknown): void;
  };
};

type ControlStylesheet = {
  href: string;
  id: string;
};

type ControlStyleBlock = {
  id: string;
  text: string;
};

export abstract class BaseControl<TState> {
  protected state: TState;

  constructor(state: TState) {
    this.state = state;
  }

  update(next: Partial<TState>) {
    this.state = { ...this.state, ...next };
    return this;
  }

  create() {
    this.attachAssets();
    return DomFactory.createElement(this.render());
  }

  createWithDocument(documentRef: { createElement(tagName: string): any }) {
    this.attachAssets();
    return DomFactory.createElementWithDocument(documentRef, this.render());
  }

  toMarkup() {
    return DomFactory.toMarkup(this.render());
  }

  static create(this: any, state?: any) {
    return new this(state).create();
  }

  static createWithDocument(this: any, documentRef: any, state?: any) {
    return new this(state).createWithDocument(documentRef);
  }

  static toMarkup(this: any, state?: any) {
    return new this(state).toMarkup();
  }

  protected attachAssets() {
    for (const style of this.styles()) {
      BaseControl.ensureStyleBlock(style);
    }
    for (const stylesheet of this.stylesheets()) {
      BaseControl.ensureStylesheet(stylesheet);
    }
    for (const control of this.childControls()) {
      control.attachAssets();
    }
  }

  protected stylesheets(): ControlStylesheet[] {
    return [];
  }

  protected styles(): ControlStyleBlock[] {
    return [];
  }

  protected childControls(): BaseControl<unknown>[] {
    return [];
  }

  protected static ensureStylesheet(stylesheet: ControlStylesheet) {
    const runtime = globalThis as typeof globalThis & {
      document?: ControlDocumentLike;
    };
    const documentRef = runtime.document;
    if (!documentRef?.head) return;
    if (documentRef.getElementById(stylesheet.id)) return;
    const element = documentRef.createElement("link");
    element.id = stylesheet.id;
    element.rel = "stylesheet";
    element.href = stylesheet.href;
    if (typeof documentRef.head.appendChild === "function") {
      documentRef.head.appendChild(element);
      return;
    }
    documentRef.head.append?.(element);
  }

  protected static ensureStyleBlock(style: ControlStyleBlock) {
    const runtime = globalThis as typeof globalThis & {
      document?: ControlDocumentLike & {
        createElement(tagName: string): {
          id: string;
          textContent?: string;
        };
      };
    };
    const documentRef = runtime.document;
    if (!documentRef?.head) return;
    if (documentRef.getElementById(style.id)) return;
    const element = documentRef.createElement("style");
    element.id = style.id;
    element.textContent = style.text;
    if (typeof documentRef.head.appendChild === "function") {
      documentRef.head.appendChild(element);
      return;
    }
    documentRef.head.append?.(element);
  }

  protected abstract render(): NodeSpec;
}
