class FakeElement {
  tagName: string;
  className = "";
  textContent = "";
  hidden = false;
  disabled = false;
  checked = false;
  tabIndex = 0;
  type = "";
  name = "";
  value = "";
  children: FakeElement[] = [];
  listeners = new Map<string, Array<(event: any) => void>>();
  attributes = new Map<string, string>();
  classSet = new Set<string>();
  classList = {
    toggle: (token: string, force?: boolean) => {
      const shouldInclude =
        force === undefined ? !this.classSet.has(token) : Boolean(force);
      if (shouldInclude) this.classSet.add(token);
      else this.classSet.delete(token);
      this.className = [...this.classSet].join(" ");
    },
  };

  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
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
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const handlers = this.listeners.get(type) ?? [];
    handlers.push(listener);
    this.listeners.set(type, handlers);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

export { FakeElement };

export function installSearchLanguagePickerFixture() {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");

  const documentStub = {
    documentElement: { lang: "en" },
    createElement(tagName: string) {
      return new FakeElement(tagName);
    },
  };
  const historyCalls: any[] = [];
  const windowStub: any = {
    location: {
      href: "http://localhost/index.en.html?panel=help&emoji=wave&emojiMode=code&group=People",
      pathname: "/index.en.html",
      search: "?panel=help&emoji=wave&emojiMode=code&group=People",
      hash: "",
    },
    history: {
      pushState(state: any, _unused: string, href: string) {
        historyCalls.push({ state, href });
      },
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
    historyCalls,
    restore() {
      if (originalWindow)
        Object.defineProperty(globalThis, "window", originalWindow);
      else delete (globalThis as any).window;
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
      else delete (globalThis as any).document;
      if (originalFetch)
        Object.defineProperty(globalThis, "fetch", originalFetch);
      else delete (globalThis as any).fetch;
    },
    setFetch(value: unknown) {
      Object.defineProperty(globalThis, "fetch", {
        configurable: true,
        value,
      });
    },
    windowStub,
  };
}
