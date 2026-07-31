export class FakeButton {
  tabIndex = -1;
  focused = false;
  clicked = false;
  dataset: Record<string, string> = {};
  parentList: FakeList | null = null;
  rect = { left: 0, top: 0, width: 10, height: 10 };

  constructor(
    readonly name: string,
    readonly className = "",
  ) {}

  focus() {
    this.focused = true;
  }

  click() {
    this.clicked = true;
  }

  closest(selector: string) {
    if (selector === ".saved-emoji-list") return this.parentList;
    return null;
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

export class FakeList {
  constructor(readonly buttons: FakeButton[]) {
    for (const button of buttons) button.parentList = this;
  }

  querySelectorAll(selector: string) {
    if (selector === "button[data-saved-emoji]") return this.buttons;
    return [];
  }
}

export class FakeCheckbox {
  checked = false;
  tabIndex = -1;
  focused = false;
  listeners = new Map<string, (event: any) => void>();
  label: FakeLabel;
  fieldset: FakeFieldset | null = null;
  rect = { left: 0, top: 0, width: 10, height: 10 };

  constructor(
    readonly value: string,
    readonly className: string,
  ) {
    this.label = new FakeLabel(this);
  }

  addEventListener(type: string, handler: (event: any) => void) {
    this.listeners.set(type, handler);
  }

  matches(selector: string) {
    return selector.includes(`input.${this.className}`);
  }

  closest(selector: string) {
    if (selector === "fieldset") return this.fieldset;
    if (selector === "label") return this.label;
    return null;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  focus() {
    this.focused = true;
  }
}

export class FakeLabel {
  rect = { left: 0, top: 0, width: 10, height: 10 };
  constructor(readonly checkbox: FakeCheckbox) {}

  querySelector(selector: string) {
    if (selector === ".modifier-emoji") return { cloneNode: () => ({}) };
    return null;
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

export class FakeFieldset {
  constructor(readonly checkboxes: FakeCheckbox[]) {
    for (const checkbox of checkboxes) checkbox.fieldset = this;
  }

  querySelectorAll(selector: string) {
    if (selector === "input.skin-tone, input.hair, input.gender") {
      return this.checkboxes;
    }
    return [];
  }
}

export function installEventAccessibilityDocument() {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dir: "ltr" },
    },
  });

  return {
    restore() {
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
    },
  };
}
