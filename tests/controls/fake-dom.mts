type FakeNode = FakeElement | string;

export class FakeElement {
  tagName: string;
  children: FakeNode[] = [];
  dataset: Record<string, string | undefined> = {};
  attributes = new Map<string, string>();
  className = "";
  textContent = "";
  type = "";
  method = "";
  id = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  append(...nodes: FakeNode[]) {
    this.children.push(...nodes);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "method") this.method = value;
    if (name === "type") this.type = value;
    if (name === "id") this.id = value;
    if (name === "class") this.className = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

export function installFakeDocument() {
  const originalDocument = (
    globalThis as typeof globalThis & { document?: any }
  ).document;
  (globalThis as typeof globalThis & { document: any }).document = {
    createElement(tagName: string) {
      return new FakeElement(tagName);
    },
  };
  return () => {
    if (originalDocument === undefined) {
      delete (globalThis as typeof globalThis & { document?: any }).document;
      return;
    }
    (globalThis as typeof globalThis & { document: any }).document =
      originalDocument;
  };
}
