import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { bindPanelDialog } from "../../../src/explorer/pwa/pwa-bind-panel-dialog.js";

class FakeButton {
  listeners = new Map<string, Array<() => void | Promise<void>>>();

  addEventListener(type: string, listener: () => void | Promise<void>) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  async click() {
    for (const listener of this.listeners.get("click") ?? []) {
      await listener();
    }
  }
}

describe("pwa-bind-panel-dialog", () => {
  it("binds the trigger and opens the resolved panel dialog", async () => {
    const button = new FakeButton();
    const ensureCalls: string[] = [];
    const openCalls: unknown[] = [];
    const phaseCalls: string[] = [];
    const dialog = {
      dataset: {},
      querySelector() {
        return null;
      },
      addEventListener() {},
    } as unknown as HTMLDialogElement;
    const dialogs = {
      favorites: undefined,
      filters: undefined,
      help: dialog,
      language: undefined,
    };

    bindPanelDialog({
      applyingUrlState: () => false,
      button: button as unknown as HTMLElement,
      dialog,
      dialogs,
      ensureDialog: async () => {
        ensureCalls.push("ensure");
      },
      onAfterOpen: async () => {
        phaseCalls.push("after-open");
      },
      onBeforeOpen: () => {
        phaseCalls.push("before-open");
      },
      openPanel(options) {
        openCalls.push(options);
      },
      panel: "help",
      renderSavedEmoji() {},
      suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
      syncUrlState() {},
      urlStateReady: () => true,
    });

    await button.click();

    assert.deepEqual(ensureCalls, ["ensure"]);
    assert.deepEqual(phaseCalls, ["before-open", "after-open"]);
    assert.equal(openCalls.length, 1);
    assert.equal(
      (openCalls[0] as { dialogs: typeof dialogs }).dialogs,
      dialogs,
    );
  });

  it("falls back to getter-based dialog resolution when direct options are omitted", async () => {
    const fallbackButton = new FakeButton();
    const fallbackDialog = {
      dataset: {},
      querySelector() {
        return null;
      },
      addEventListener() {},
    } as unknown as HTMLDialogElement;
    const fallbackDialogs = {
      favorites: undefined,
      filters: undefined,
      help: fallbackDialog,
      language: undefined,
    };
    const fallbackOpenCalls: unknown[] = [];
    let getDialogsCalls = 0;
    let getDialogCalls = 0;
    let getLanguageListCalls = 0;
    const resolvedLanguageList = { id: "language-list" } as HTMLElement;

    bindPanelDialog({
      applyingUrlState: () => false,
      button: fallbackButton as unknown as HTMLElement,
      getDialog: () => {
        getDialogCalls += 1;
        return undefined;
      },
      getDialogs: () => {
        getDialogsCalls += 1;
        return fallbackDialogs;
      },
      getLanguageList: () => {
        getLanguageListCalls += 1;
        return resolvedLanguageList;
      },
      openPanel(options) {
        fallbackOpenCalls.push(options);
      },
      panel: "help",
      renderSavedEmoji() {},
      suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
      syncUrlState() {},
      urlStateReady: () => true,
    });

    await fallbackButton.click();

    assert.equal(getDialogsCalls > 0, true);
    assert.equal(getDialogCalls > 0, true);
    assert.equal(getLanguageListCalls, 1);
    assert.equal(fallbackOpenCalls.length, 1);
    assert.equal(
      (fallbackOpenCalls[0] as { languageList: HTMLElement }).languageList,
      resolvedLanguageList,
    );
  });

  it("skips opening when panel dialogs are unavailable", async () => {
    let openedWithoutDialogs = false;
    const missingDialogsButton = new FakeButton();

    bindPanelDialog({
      applyingUrlState: () => false,
      button: missingDialogsButton as unknown as HTMLElement,
      openPanel() {
        openedWithoutDialogs = true;
      },
      panel: "help",
      renderSavedEmoji() {},
      suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
      syncUrlState() {},
      urlStateReady: () => true,
    });

    await missingDialogsButton.click();

    assert.equal(openedWithoutDialogs, false);
  });

  it("uses a directly resolved dialog when available from getDialog", async () => {
    const eagerDialog = {
      dataset: {},
      querySelector() {
        return null;
      },
      addEventListener() {},
    } as unknown as HTMLDialogElement;
    let directDialogCalls = 0;
    const directDialogButton = new FakeButton();

    bindPanelDialog({
      applyingUrlState: () => false,
      button: directDialogButton as unknown as HTMLElement,
      getDialog: () => {
        directDialogCalls += 1;
        return eagerDialog;
      },
      getDialogs: () => ({
        favorites: undefined,
        filters: undefined,
        help: eagerDialog,
        language: undefined,
      }),
      openPanel() {},
      panel: "help",
      renderSavedEmoji() {},
      suppressedPanelCloses: new WeakSet<HTMLDialogElement>(),
      syncUrlState() {},
      urlStateReady: () => true,
    });

    await directDialogButton.click();

    assert.equal(directDialogCalls > 0, true);
  });
});
