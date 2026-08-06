export class FakeElement {
  hidden = false;
  open = false;
  title = "";
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event: any) => void>>();
  attributes = new Map<string, string>();
  focused = false;
  blurred = false;
  queryMap = new Map<string, any>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
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
      listener({ currentTarget: this, ...event });
    }
  }

  querySelector(selector: string) {
    return this.queryMap.get(selector) ?? null;
  }

  focus() {
    this.focused = true;
  }

  blur() {
    this.blurred = true;
  }
}

export class FakeDialog extends FakeElement {
  ownerDocument: any;

  constructor(ownerDocument?: any) {
    super();
    this.ownerDocument = ownerDocument;
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }
}

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalHTMLElementDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLElement",
);
const originalHTMLDialogElementDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLDialogElement",
);

export function restorePwaGlobals() {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocumentDescriptor) {
    Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalNavigatorDescriptor) {
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "navigator");
  }
  if (originalHTMLElementDescriptor) {
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElementDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "HTMLElement");
  }
  if (originalHTMLDialogElementDescriptor) {
    Object.defineProperty(
      globalThis,
      "HTMLDialogElement",
      originalHTMLDialogElementDescriptor,
    );
  } else {
    Reflect.deleteProperty(globalThis, "HTMLDialogElement");
  }
}

export function installPwaGlobals() {
  const manifestLink = new FakeElement();
  manifestLink.setAttribute("href", "./manifest.webmanifest");
  const historyBackCalls: string[] = [];
  const historyState = { existing: true };
  const mediaQueries = [
    { matches: false },
    { matches: true },
    { matches: false },
    { matches: false },
  ];
  const windowStub: any = {
    location: {
      pathname: "/index.en.html",
      search: "?panel=help&mode=developer",
      hash: "#top",
    },
    matchMedia(query: string) {
      const index = [
        "(display-mode: standalone)",
        "(display-mode: fullscreen)",
        "(display-mode: minimal-ui)",
        "(display-mode: window-controls-overlay)",
      ].indexOf(query);
      return mediaQueries[index] ?? { matches: false };
    },
    navigator: {
      standalone: false,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      userAgentData: undefined,
      maxTouchPoints: 2,
    },
    history: {
      state: historyState,
      back() {
        historyBackCalls.push("back");
      },
      replaceState(_state: any, _title: string, url: string) {
        historyBackCalls.push(`replace:${url}`);
      },
    },
    requestAnimationFrame(handler: () => void) {
      handler();
    },
  };
  const documentStub = {
    referrer: "",
    querySelector(selector: string) {
      if (selector === 'link[rel="manifest"]') return manifestLink;
      return null;
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowStub,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: windowStub.navigator,
  });
  Object.defineProperty(globalThis, "HTMLElement", {
    configurable: true,
    value: FakeElement,
  });
  Object.defineProperty(globalThis, "HTMLDialogElement", {
    configurable: true,
    value: FakeDialog,
  });

  return {
    documentStub,
    historyBackCalls,
    historyState,
    manifestLink,
    mediaQueries,
    windowStub,
  };
}
