export class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  className = "";
  title = "";
  open = false;
  focused = false;
  private textValue = "";
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      this.classSet = new Set(this.className.split(/\s+/).filter(Boolean));
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
      return shouldInclude;
    },
  };
  listeners = new Map<string, Array<(event: any) => void>>();

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get textContent() {
    return this.textValue;
  }

  set textContent(value: string) {
    this.textValue = value;
  }

  append(...children: FakeElement[]) {
    this.children.push(...children);
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [...children];
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
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

export function installPickerGridDom() {
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
    restore() {
      if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
      else delete (globalThis as any).document;
      if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
      else delete (globalThis as any).window;
    },
  };
}
