export class FakeButton {
  hidden = false;
  disabled = false;
  tabIndex = -1;
  dataset: Record<string, string | undefined> = {};
  classList = {
    contains: (name: string) => this.classes.has(name),
  };
  private classes = new Set<string>();
  private attributes = new Map<string, string>();
  private listeners = new Map<string, Array<(event: any) => void>>();
  private rects: Array<Record<string, number>> = [{}];
  private rect = { left: 0, top: 0, width: 20, height: 20 };
  focused = false;

  constructor(
    options: {
      ariaPressed?: string;
      activeClass?: string;
      selectedClass?: string;
      tabIndex?: number;
      left?: number;
      top?: number;
      width?: number;
      height?: number;
      hidden?: boolean;
      disabled?: boolean;
      visible?: boolean;
    } = {},
  ) {
    if (options.ariaPressed)
      this.attributes.set("aria-pressed", options.ariaPressed);
    if (options.activeClass) this.classes.add(options.activeClass);
    if (options.selectedClass) this.classes.add(options.selectedClass);
    if (options.tabIndex !== undefined) this.tabIndex = options.tabIndex;
    if (options.hidden) this.hidden = true;
    if (options.disabled) this.disabled = true;
    if (options.visible === false) this.rects = [];
    this.rect = {
      left: options.left ?? 0,
      top: options.top ?? 0,
      width: options.width ?? 20,
      height: options.height ?? 20,
    };
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  getClientRects() {
    return this.rects;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  focus() {
    this.focused = true;
    this.dispatch("focus");
  }

  click() {
    this.dispatch("click");
  }
}

export function resetFocus(buttons: FakeButton[]) {
  buttons.forEach((button) => {
    button.focused = false;
  });
}

export function keyEvent(key: string) {
  let prevented = false;
  return {
    key,
    preventDefault() {
      prevented = true;
    },
    get prevented() {
      return prevented;
    },
  };
}

export function installGridNavigationDom() {
  const browserGlobal = globalThis as any;
  const originalDocument = browserGlobal.document;
  const originalGetComputedStyle = browserGlobal.getComputedStyle;

  browserGlobal.document = {
    documentElement: { dir: "ltr" },
  };

  browserGlobal.getComputedStyle = (button: FakeButton) => ({
    gridRowStart: button.dataset.gridRow ?? "1",
    gridColumnStart: button.dataset.gridColumn ?? "1",
  });

  return {
    browserGlobal,
    restore() {
      browserGlobal.document = originalDocument;
      browserGlobal.getComputedStyle = originalGetComputedStyle;
    },
  };
}
