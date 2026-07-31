import assert from "node:assert/strict";
import {
  buildLanguageOption,
  createLanguageDialogControl,
  createLanguagePickerControl,
  getLocalizedLanguageName,
} from "../../src/explorer/language/language-dialog-control.js";

class FakeElement {
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
    for (const listener of this.listeners.get(type) ?? []) listener(event);
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

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

const documentStub: any = {
  documentElement: { lang: "en" },
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});

try {
  const picker = createLanguagePickerControl();
  assert.equal(picker.button.tagName, "BUTTON");
  assert.equal(picker.button.getAttribute("aria-haspopup"), "dialog");
  assert.equal(picker.button.getAttribute("aria-controls"), "language-dialog");
  assert.equal(
    picker.button.getAttribute("aria-labelledby"),
    "language-picker-accessible-label language-picker-current-label",
  );
  assert.equal(picker.flag.textContent, "🌐");
  assert.equal(picker.label.textContent, "Language");

  const dialogControl = createLanguageDialogControl();
  assert.equal(dialogControl.dialog.tagName, "DIALOG");
  assert.equal(dialogControl.dialog.className, "language-dialog");
  assert.equal(dialogControl.dialog.id, "language-dialog");
  assert.equal(
    dialogControl.dialog.getAttribute("aria-labelledby"),
    "language-title",
  );
  assert.equal(dialogControl.dialog.children.length, 3);
  assert.equal(dialogControl.dialog.children[1].tagName, "P");
  assert.equal(dialogControl.dialog.children[1].className, "dialog-description");
  assert.equal(dialogControl.dialog.children[1].textContent, "Choose a language for emoji search.");
  assert.equal(dialogControl.list.className, "language-list");
  assert.equal(dialogControl.list.getAttribute("role"), "radiogroup");
  assert.equal(dialogControl.list.getAttribute("aria-labelledby"), "language-title");

  const clicks: any[] = [];
  const selectedOption = buildLanguageOption({
    flag: "🇸🇦",
    label: "Arabic",
    href: "./index.ar.html",
    selected: true,
    locale: "ar",
    onSelectLanguageLink: async (event, locale, href) => {
      clicks.push({ event, locale, href });
    },
  }) as any;
  assert.equal(selectedOption.className, "language-option is-selected");
  assert.equal(selectedOption.getAttribute("role"), "radio");
  assert.equal(selectedOption.getAttribute("aria-checked"), "true");
  assert.equal(selectedOption.getAttribute("aria-pressed"), "true");
  assert.equal(selectedOption.tabIndex, 0);
  assert.equal(selectedOption.children[0].tagName, "INPUT");
  assert.equal(selectedOption.children[0].type, "radio");
  assert.equal(selectedOption.children[0].name, "language-choice");
  assert.equal(selectedOption.children[0].value, "ar");
  assert.equal(selectedOption.children[0].checked, true);
  assert.equal(selectedOption.children[0].tabIndex, -1);
  assert.equal(selectedOption.children[1].textContent, "🇸🇦");
  assert.equal(selectedOption.children[1].getAttribute("aria-hidden"), "true");
  assert.equal(selectedOption.children[2].textContent, "Arabic");
  selectedOption.dispatch("click", { type: "click" });
  assert.deepEqual(clicks[0], {
    event: { type: "click" },
    locale: "ar",
    href: "./index.ar.html",
  });

  const unselectedOption = buildLanguageOption({
    flag: "🇬🇧",
    label: "English",
    href: "./index.en.html",
    selected: false,
    locale: "en",
    onSelectLanguageLink: async () => {},
  }) as any;
  assert.equal(unselectedOption.getAttribute("aria-checked"), "false");
  assert.equal(unselectedOption.getAttribute("aria-pressed"), "false");
  assert.equal(unselectedOption.tabIndex, -1);
  assert.equal(unselectedOption.children[0].checked, false);

  documentStub.documentElement.lang = "en";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "",
    ),
    "Arabic (العربية)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "ar",
    ),
    "Arabic",
  );
  documentStub.documentElement.lang = "ar";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "ar",
        label: "Arabic",
        nativeLabel: "العربية",
        rtl: true,
        file: "ar.json",
      },
      "",
    ),
    "العربية",
  );
  documentStub.documentElement.lang = "es";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "Neohabla (Newspeak)",
  );
  documentStub.documentElement.lang = "ar";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "لغة الأخبار (Newspeak)",
  );
  documentStub.documentElement.lang = "zh";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "新话 (Newspeak)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "en-x-newspeak",
    ),
    "新话",
  );
  documentStub.documentElement.lang = "en-x-newspeak";
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en",
        label: "English",
        nativeLabel: "English",
        rtl: false,
        file: "en.json",
      },
      "",
    ),
    "oldspeak (English)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-GB",
        label: "British English",
        nativeLabel: "British English",
        rtl: false,
        file: "en-GB.json",
        baseLocale: "en",
      },
      "",
    ),
    "oldspeak (British English)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "es",
        label: "Spanish",
        nativeLabel: "Español",
        rtl: false,
        file: "es.json",
      },
      "",
    ),
    "other oldspeak (Español)",
  );
  assert.equal(
    getLocalizedLanguageName(
      {
        locale: "en-x-newspeak",
        label: "Newspeak English",
        nativeLabel: "Newspeak",
        rtl: false,
        file: "en-x-newspeak.json",
        baseLocale: "en",
      },
      "",
    ),
    "newspeak",
  );
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
}
