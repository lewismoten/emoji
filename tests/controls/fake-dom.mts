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

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const results: FakeElement[] = [];
    const matches = (node: FakeElement) => {
      if (selector.startsWith(".")) {
        return node.className.split(/\s+/).includes(selector.slice(1));
      }
      if (selector.startsWith("#")) {
        return node.id === selector.slice(1);
      }
      return node.tagName === selector.toUpperCase();
    };
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift();
      if (!(current instanceof FakeElement)) continue;
      if (matches(current)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
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
      return (
        head.children.find(
          (node) => node instanceof FakeElement && node.id === id,
        ) ?? null
      );
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
