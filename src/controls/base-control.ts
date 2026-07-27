import { DomFactory, type NodeSpec } from "./dom-factory.js";

type ControlDocumentLike = {
  createElement(tagName: string): {
    id: string;
    rel: string;
    href: string;
  };
  getElementById(id: string): unknown;
  head?: {
    appendChild(node: unknown): void;
  };
};

type ControlStylesheet = {
  href: string;
  id: string;
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

  toMarkup() {
    return DomFactory.toMarkup(this.render());
  }

  static create(this: any, state?: any) {
    return new this(state).create();
  }

  static toMarkup(this: any, state?: any) {
    return new this(state).toMarkup();
  }

  protected attachAssets() {
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
    documentRef.head.appendChild(element);
  }

  protected abstract render(): NodeSpec;
}
