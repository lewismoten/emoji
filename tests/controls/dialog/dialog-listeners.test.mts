import assert from "node:assert/strict";

import * as dialogListeners from "../../../src/controls/dialog/dialog-listeners.js";

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalMutationObserver = Object.getOwnPropertyDescriptor(
  globalThis,
  "MutationObserver",
);
const originalHTMLDialogElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLDialogElement",
);

class FakeBody {
  attributes = new Map<string, string>();

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

class FakeDialog {
  open = false;

  constructor(private readonly selectors: string[] = []) {}

  matches(selector: string) {
    return this.selectors.includes(selector);
  }
}

const restoreGlobals = () => {
  dialogListeners.clear();
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalMutationObserver) {
    Object.defineProperty(
      globalThis,
      "MutationObserver",
      originalMutationObserver,
    );
  } else {
    Reflect.deleteProperty(globalThis, "MutationObserver");
  }
  if (originalHTMLDialogElement) {
    Object.defineProperty(
      globalThis,
      "HTMLDialogElement",
      originalHTMLDialogElement,
    );
  } else {
    Reflect.deleteProperty(globalThis, "HTMLDialogElement");
  }
};

try {
  Reflect.deleteProperty(globalThis, "MutationObserver");
  Reflect.deleteProperty(globalThis, "document");

  const noObserverListener = () => {};
  assert.equal(dialogListeners.add(noObserverListener as any), true);
  assert.equal(dialogListeners.add(noObserverListener as any), false);
  assert.equal(dialogListeners.remove(noObserverListener as any), true);
  assert.equal(dialogListeners.remove(noObserverListener as any), false);
  assert.doesNotThrow(() => dialogListeners.clear());

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {},
  });
  const noBodyListener = () => {};
  assert.equal(dialogListeners.add(noBodyListener as any), true);
  assert.equal(dialogListeners.remove(noBodyListener as any), true);
  dialogListeners.clear();

  const body = new FakeBody();
  const observerRecords: Array<{
    callback: (records: Array<{ target: unknown }>) => void;
    observed: Array<{ target: unknown; options: unknown }>;
    disconnects: number;
  }> = [];

  Object.defineProperty(globalThis, "HTMLDialogElement", {
    configurable: true,
    value: FakeDialog,
  });
  Object.defineProperty(globalThis, "MutationObserver", {
    configurable: true,
    value: class FakeMutationObserver {
      callback: (records: Array<{ target: unknown }>) => void;
      observed: Array<{ target: unknown; options: unknown }> = [];
      disconnects = 0;

      constructor(callback: (records: Array<{ target: unknown }>) => void) {
        this.callback = callback;
        observerRecords.push(this);
      }

      disconnect() {
        this.disconnects += 1;
      }

      observe(target: unknown, options: unknown) {
        this.observed.push({ target, options });
      }
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { body },
  });

  const calls: Array<[string, FakeDialog]> = [];
  const listener = ((action: "open" | "close", dialog: FakeDialog) => {
    calls.push([action, dialog]);
  }) as any;

  assert.equal(dialogListeners.add(listener), true);
  assert.equal(body.getAttribute("data-dialog-observer"), "true");
  assert.equal(observerRecords.length, 1);
  assert.deepEqual(observerRecords[0]?.observed, [
    {
      target: body,
      options: {
        subtree: true,
        attributes: true,
        attributeFilter: ["open"],
      },
    },
  ]);

  assert.equal(dialogListeners.add(listener), false);
  assert.equal(observerRecords.length, 1);

  observerRecords[0]?.callback([
    { target: {} },
    { target: new FakeDialog([]) },
  ]);
  assert.deepEqual(calls, []);

  const openDialog = new FakeDialog([".dialog"]);
  openDialog.open = true;
  const closedDialog = new FakeDialog([".dialog"]);
  closedDialog.open = false;
  observerRecords[0]?.callback([
    { target: openDialog },
    { target: closedDialog },
  ]);
  assert.deepEqual(calls, [
    ["open", openDialog],
    ["close", closedDialog],
  ]);

  assert.equal(dialogListeners.remove(listener), true);
  assert.equal(body.hasAttribute("data-dialog-observer"), true);
  assert.equal(observerRecords[0]?.disconnects, 0);

  body.setAttribute("data-dialog-observer", "false");
  assert.doesNotThrow(() => dialogListeners.clear());
  assert.equal(body.hasAttribute("data-dialog-observer"), false);
  assert.equal(observerRecords[0]?.disconnects, 1);
} finally {
  restoreGlobals();
}
