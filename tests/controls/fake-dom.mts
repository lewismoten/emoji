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
  rel = "";
  href = "";

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
    if (name === "rel") this.rel = value;
    if (name === "href") this.href = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

export function installFakeDocument() {
  const originalDocument = (
    globalThis as typeof globalThis & { document?: any }
  ).document;
  const head = new FakeElement("head");
  (globalThis as typeof globalThis & { document: any }).document = {
    createElement(tagName: string) {
      return new FakeElement(tagName);
    },
    getElementById(id: string) {
      return head.children.find(
        (node) => node instanceof FakeElement && node.id === id,
      ) ?? null;
    },
    head,
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
