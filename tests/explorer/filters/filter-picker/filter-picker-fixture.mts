export class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  private textValue = "";
  value = "";
  label = "";
  title = "";
  className = "";
  disabled = false;
  open = false;
  tabIndex = 0;
  focused = false;
  listeners = new Map<string, Array<(event: any) => void>>();
  parent: FakeElement | null = null;
  rect = { left: 0, top: 0, width: 20, height: 20 };
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
      return shouldInclude;
    },
  };

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get textContent() {
    return this.textValue;
  }

  set textContent(value: string) {
    this.textValue = value;
  }

  get text() {
    return this.textValue;
  }

  set text(value: string) {
    this.textValue = value;
  }

  append(...children: FakeElement[]) {
    for (const child of children) {
      child.parent = this;
      this.children.push(child);
    }
  }

  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [];
    this.append(...children);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "role") this.dataset.role = value;
    if (name.startsWith("data-")) this.dataset[name.slice(5)] = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ currentTarget: this, target: this, ...event });
    }
  }

  focus() {
    this.focused = true;
  }

  close() {
    this.open = false;
  }

  showModal() {
    this.open = true;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (selector === '[role="radio"]' && current.getAttribute("role") === "radio") {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector === ".filter-picker-emoji") {
        return element.className.split(/\s+/).includes("filter-picker-emoji");
      }
      if (selector === ".filter-picker-value") {
        return element.className.split(/\s+/).includes("filter-picker-value");
      }
      if (selector === '[role="radio"]') {
        return element.getAttribute("role") === "radio";
      }
      if (selector === '[aria-checked="true"]') {
        return element.getAttribute("aria-checked") === "true";
      }
      return false;
    };
    const results: FakeElement[] = [];
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matches(current)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }
}

export function installDocumentWindow() {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const documentStub: any = {
    documentElement: { dir: "ltr" },
    createElement(tagName: string) {
      return new FakeElement(tagName);
    },
  };
  const windowStub: any = {
    requestAnimationFrame(handler: () => void) {
      handler();
    },
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowStub,
  });

  return {
    documentStub,
    restore() {
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        delete (globalThis as any).document;
      }
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        delete (globalThis as any).window;
      }
    },
  };
}
