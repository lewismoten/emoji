export class FakeNode {
  childNodes: any[] = [];

  constructor(readonly text?: string) {}

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }
}

export class FakeElement {
  className = "";
  textContent = "";
  type = "";
  hidden = false;
  id = "";
  tabIndex = -1;
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  listeners = new Map<string, () => void>();
  childNodes: any[] = [];
  focused = false;
  rect = { left: 0, top: 0, width: 10, height: 10 };

  constructor(readonly tagName: string) {}

  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  }

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  closest(selector: string) {
    return selector === "[data-emoji-key]" ? this : null;
  }

  focus() {
    this.focused = true;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  replaceChildren(...nodes: any[]) {
    this.childNodes = nodes;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

export function installEmojiListInteractionRuntime() {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalPerformance = Object.getOwnPropertyDescriptor(
    globalThis,
    "performance",
  );

  const timers: Array<() => void> = [];
  let yielded = 0;
  const focusedById = new Map<string, FakeElement>();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      scheduler: {
        yield() {
          yielded += 1;
          return Promise.resolve();
        },
      },
      setTimeout(callback: () => void) {
        timers.push(callback);
        return timers.length;
      },
    },
  });
  Object.defineProperty(globalThis, "performance", {
    configurable: true,
    value: {
      now() {
        return 0;
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createDocumentFragment() {
        return new FakeNode();
      },
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
      documentElement: { dir: "ltr" },
      getElementById(id: string) {
        return focusedById.get(id) ?? null;
      },
    },
  });

  return {
    focusedById,
    timers,
    get yielded() {
      return yielded;
    },
    setScheduler(value: any) {
      (globalThis as any).window.scheduler = value;
    },
    restore() {
      if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
      else Reflect.deleteProperty(globalThis, "window");
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
      if (originalPerformance)
        Object.defineProperty(globalThis, "performance", originalPerformance);
      else Reflect.deleteProperty(globalThis, "performance");
    },
  };
}
