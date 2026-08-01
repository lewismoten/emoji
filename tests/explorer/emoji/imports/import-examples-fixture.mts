export const importExamplesManifest = {
  packs: [
    { id: "popular", importPath: "@lewismoten/emoji/popular", keys: ["wave"] },
    { id: "all", importPath: "@lewismoten/emoji/all" },
  ],
  categories: [
    {
      label: "Objects",
      importPath: "@lewismoten/emoji/categories/objects",
      subcategories: [
        {
          unicodeSubgroup: "mail",
          importPath: "@lewismoten/emoji/categories/objects/mail",
        },
      ],
    },
  ],
};

export class FakeNode {
  className = "";
  hidden = false;
  textContent: string | null = "";
  childNodes: any[] = [];
  parent: FakeNode | null = null;

  constructor(className = "") {
    this.className = className;
  }

  append(...nodes: any[]) {
    for (const node of nodes) {
      if (node instanceof FakeNode) node.parent = this;
      this.childNodes.push(node);
    }
  }

  after(...nodes: any[]) {
    if (!this.parent) return;
    const index = this.parent.childNodes.indexOf(this);
    this.parent.childNodes.splice(index + 1, 0, ...nodes);
    nodes.forEach((node) => {
      if (node instanceof FakeNode) node.parent = this.parent;
    });
  }

  replaceChildren(...nodes: any[]) {
    this.childNodes = [];
    this.append(...nodes);
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const classes = selector
      .split(/\s+/)
      .map((value) => value.replace(/^\./, ""));
    const results: FakeNode[] = [];
    const walk = (node: FakeNode) => {
      for (const child of node.childNodes) {
        if (!(child instanceof FakeNode)) continue;
        walk(child);
        if (
          classes.length === 1 &&
          child.className.split(/\s+/).includes(classes[0]!)
        ) {
          results.push(child);
        } else if (
          classes.length === 2 &&
          child.className.split(/\s+/).includes(classes[1]!) &&
          child.parent?.className.split(/\s+/).includes(classes[0]!)
        ) {
          results.push(child);
        }
      }
    };
    walk(this);
    return results;
  }
}

export function installImportExamplesFixture() {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const originalWarn = console.warn;
  const queried = new Map<string, FakeNode>();
  const warnings: any[][] = [];

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement() {
        return new FakeNode();
      },
      querySelector(selector: string) {
        return queried.get(selector) ?? null;
      },
    },
  });

  console.warn = (...args: any[]) => warnings.push(args);

  return {
    queried,
    restore() {
      console.warn = originalWarn;
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, "document");
      }
      if (originalFetch) {
        Object.defineProperty(globalThis, "fetch", originalFetch);
      } else {
        Reflect.deleteProperty(globalThis, "fetch");
      }
    },
    setFetch(value: unknown) {
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value,
      });
    },
    warnings,
  };
}
