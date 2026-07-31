export class FakeElement {
  tagName: string;
  attributes = new Map<string, string>();
  children: FakeElement[] = [];
  className = "";
  classList = {
    add: (...names: string[]) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      for (const name of names) classes.add(name);
      this.className = [...classes].join(" ");
    },
    remove: (...names: string[]) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      for (const name of names) classes.delete(name);
      this.className = [...classes].join(" ");
    },
    toggle: (name: string, force?: boolean) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      const shouldAdd = force ?? !classes.has(name);
      if (shouldAdd) classes.add(name);
      else classes.delete(name);
      this.className = [...classes].join(" ");
      return shouldAdd;
    },
    contains: (name: string) => this.className.split(/\s+/).includes(name),
  };
  dataset: Record<string, string | undefined> = {};
  hidden = false;
  id = "";
  min = "";
  max = "";
  options: Array<{ value: string }> = [];
  parent: FakeElement | null = null;
  role = "";
  step = "";
  textContent = "";
  type = "";
  value = "";
  private innerHtmlValue = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get childNodes() {
    return this.children;
  }

  get innerHTML() {
    return this.innerHtmlValue;
  }

  set innerHTML(value: string) {
    this.innerHtmlValue = value;
    this.children = [];
    if (!value.includes("select-sequence-type")) return;
    const heading = new FakeElement("div");
    heading.className = "filter-heading";
    const label = new FakeElement("span");
    label.id = "sequence-filter-label";
    label.dataset.i18n = "sequenceType";
    label.textContent = "Sequence type";
    const compactLabel = new FakeElement("span");
    compactLabel.className = "compact-sequence-label";
    heading.append(label, compactLabel);
    const select = new FakeElement("select");
    select.className = "select-sequence-type";
    select.setAttribute("aria-labelledby", "sequence-filter-label");
    const choices = new FakeElement("div");
    choices.className = "compact-choices compact-sequence-choices";
    choices.setAttribute("role", "radiogroup");
    choices.setAttribute("aria-labelledby", "sequence-filter-label");
    this.append(heading, select, choices);
  }

  append(...nodes: FakeElement[]) {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }

  appendChild(node: FakeElement) {
    node.parent = this;
    this.children.push(node);
    return node;
  }

  before(node: FakeElement) {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    node.parent = this.parent;
    this.parent.children.splice(index, 0, node);
  }

  prepend(node: FakeElement) {
    node.parent = this;
    this.children.unshift(node);
  }

  replaceWith(node: FakeElement) {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    node.parent = this.parent;
    this.parent.children.splice(index, 1, node);
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (selector.startsWith(".") && current.className.split(/\s+/).includes(selector.slice(1))) {
        return current;
      }
      if (current.tagName === selector.toUpperCase()) return current;
      current = current.parent;
    }
    return null;
  }

  querySelector(selector: string): FakeElement | null {
    const matcher = (element: FakeElement) => {
      if (selector.startsWith(".")) {
        return element.className.split(/\s+/).includes(selector.slice(1));
      }
      return element.tagName === selector.toUpperCase();
    };
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matcher(current)) return current;
      stack.unshift(...current.children);
    }
    return null;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "aria-labelledby") this.dataset["attr:aria-labelledby"] = value;
    if (name === "role") this.role = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

export class FakeDocument {
  head = new FakeElement("head");
  body = new FakeElement("body");

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  getElementById(id: string) {
    return this.walk().find((element) => element.id === id) ?? null;
  }

  getElementsByClassName(className: string) {
    return this.walk().filter((element) =>
      element.className.split(/\s+/).includes(className),
    );
  }

  querySelector(selector: string) {
    if (selector === ".filter-grid .version-field") {
      return this.walk().find(
        (element) =>
          element.className.split(/\s+/).includes("version-field") &&
          element.parent?.className.split(/\s+/).includes("filter-grid"),
      ) ?? null;
    }
    return this.body.querySelector(selector);
  }

  private walk() {
    const results: FakeElement[] = [];
    const stack = [this.body, this.head];
    while (stack.length > 0) {
      const current = stack.shift()!;
      results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }
}

export function installFakeDocument(document: FakeDocument) {
  const runtime = globalThis as typeof globalThis & {
    document?: unknown;
  };
  const originalDocument = runtime.document;
  (runtime as { document: any }).document = document;
  return () => {
    if (originalDocument === undefined) {
      Reflect.deleteProperty(runtime, "document");
    } else {
      (runtime as { document: any }).document = originalDocument;
    }
  };
}
