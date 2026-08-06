export class FakeElement {
  tagName: string;
  className = "";
  id = "";
  type = "";
  name = "";
  value = "";
  checked = false;
  tabIndex = 0;
  textContent = "";
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event: any) => void>>();
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

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  append(...children: FakeElement[]) {
    this.children.push(...children);
  }

  appendChild(child: FakeElement) {
    this.children.push(child);
    return child;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "id") this.id = value;
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
      listener(event);
    }
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector.startsWith(".")) {
        return element.className.split(/\s+/).includes(selector.slice(1));
      }
      if (selector.startsWith("#")) {
        return element.id === selector.slice(1);
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

export const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
export const originalIntlDisplayNames = Intl.DisplayNames;

export const documentStub: any = {
  documentElement: { lang: "en" },
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};

export function installLanguageDialogFixture() {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });
}

export function restoreLanguageDialogFixture() {
  Object.defineProperty(Intl, "DisplayNames", {
    configurable: true,
    value: originalIntlDisplayNames,
  });
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    delete (globalThis as any).document;
  }
}
