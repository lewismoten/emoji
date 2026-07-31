import assert from "node:assert/strict";

export type FakeOption = { value: string; text: string };

export class FakeSelect {
  value = "";
  disabled = false;
  options: FakeOption[] = [];

  replaceChildren() {
    this.options = [];
  }

  appendChild(option: FakeOption) {
    this.options.push(option);
  }
}

export function installOptionDocument() {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag: string) {
        assert.equal(tag, "option");
        return { value: "", text: "" };
      },
    },
  });
  return () => {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else Reflect.deleteProperty(globalThis, "document");
  };
}
