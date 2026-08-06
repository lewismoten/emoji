import { afterEach, describe, expect, it } from "vitest";

import {
  applyDialogView,
  createEmojiDialogViewController,
  loadStylesheet,
} from "../../../src/explorer/dialog/dialog-view.js";
import * as state from "../../../src/state.js";

describe("dialog-view", () => {
  const originalDocument = globalThis.document;
  const originalQueueMicrotask = globalThis.queueMicrotask;

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    globalThis.queueMicrotask = originalQueueMicrotask;
    state.emojiByKey.replace({});
    state.byId.replace({});
  });

  it("applies view modes, loads stylesheets, and controls dialog focus", async () => {
    class FakeClassList {
      names = new Set<string>();
      toggle(name: string, force?: boolean) {
        if (force === true) this.names.add(name);
        else if (force === false) this.names.delete(name);
      }
      contains(name: string) {
        return this.names.has(name);
      }
    }
    class FakeElement {
      hidden = false;
      dataset: Record<string, string> = {};
      classList = new FakeClassList();
      textContent = "";
      selectors = new Map<string, FakeElement>();
      focused = 0;
      id = "";
      rel = "";
      href = "";
      sheet: unknown = undefined;
      listeners = new Map<string, Array<() => void>>();
      querySelector<T = FakeElement>(selector: string) {
        return (this.selectors.get(selector) ?? null) as T | null;
      }
      addEventListener(type: string, listener: () => void) {
        const list = this.listeners.get(type) ?? [];
        list.push(listener);
        this.listeners.set(type, list);
      }
      dispatch(type: string) {
        for (const listener of this.listeners.get(type) ?? []) listener();
      }
      focus() {
        this.focused += 1;
      }
    }
    class FakeDocument {
      head = { appended: [] as FakeElement[], appendChild: (node: FakeElement) => this.head.appended.push(node) };
      byId = new Map<string, FakeElement>();
      createElement() {
        return new FakeElement();
      }
      getElementById(id: string) {
        return this.byId.get(id) ?? null;
      }
    }

    const detailsDialog = new FakeElement();
    const details = new FakeElement();
    const metadata = new FakeElement();
    const copyActions = new FakeElement();
    const codeView = new FakeElement();
    const composition = new FakeElement();
    composition.dataset.available = "true";
    const diagnostic = new FakeElement();
    diagnostic.dataset.available = "false";
    const invitation = new FakeElement();
    invitation.dataset.available = "true";
    const eyebrow = new FakeElement();
    detailsDialog.selectors.set(".emoji-dialog-details", details);
    detailsDialog.selectors.set(".emoji-metadata", metadata);
    detailsDialog.selectors.set(".emoji-copy-actions", copyActions);
    detailsDialog.selectors.set(".emoji-code-view", codeView);
    detailsDialog.selectors.set(".emoji-composition", composition);
    detailsDialog.selectors.set(".rendering-diagnostic", diagnostic);
    detailsDialog.selectors.set(".pixel-design-invitation", invitation);
    detailsDialog.selectors.set(".emoji-dialog-eyebrow", eyebrow);

    expect(
      applyDialogView({
        developerMode: true,
        fullDeveloperMode: true,
        dialog: detailsDialog as any,
        requestedMode: false,
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "details", showDetails: true });

    const fakeDocument = new FakeDocument();
    (globalThis as any).document = fakeDocument;
    const loadedLink = new FakeElement();
    loadedLink.id = "sheet-loaded";
    loadedLink.sheet = {};
    fakeDocument.byId.set("sheet-loaded", loadedLink);
    expect(await loadStylesheet("/loaded.css", "sheet-loaded")).toBe(loadedLink);

    const dialog = new FakeElement();
    (dialog as any).open = true;
    state.emojiByKey.replace({ wrappedGift: "🎁" });
    state.byId.replace({ wrappedGift: { key: "wrappedGift" } as any });
    const modeBack = new FakeElement();
    const preview = new FakeElement();
    const codeCopy = new FakeElement();
    dialog.selectors.set(".dialog-mode-back", modeBack);
    dialog.selectors.set(".emoji-preview", preview);
    dialog.selectors.set('[data-copy="code"]', codeCopy);
    const parent = new FakeElement();
    globalThis.queueMicrotask = ((callback: () => void) => callback()) as any;
    let editor: any = {
      element: new FakeElement(),
      openCalls: [] as any[],
      open(key: string, value: string) {
        this.openCalls.push([key, value]);
      },
    };
    const controller = createEmojiDialogViewController({
      byId: () => ({ wrappedGift: { key: "wrappedGift" } }),
      currentDialogParentStack: () => ["favorites"],
      currentEmojiKey: () => "wrappedGift",
      developerModeEnabled: () => true,
      dialog: () => dialog as any,
      emojiByKey: () => ({ wrappedGift: "🎁" }),
      emojiParent: () => parent as any,
      ensurePixelEditor: async () => undefined,
      getPixelEditor: () => editor,
      loadPackageManifest: async () => ({}),
      syncUrlState: () => undefined,
      translate: (key, fallback) => `${fallback}:${key}`,
      updateCompositionBackButton: () => undefined,
      updateImportExamples: () => undefined,
    });
    controller.setView("code");
    controller.focusInitialAction();
    expect(codeCopy.focused).toBe(1);
    controller.setView("editor");
    expect(editor.openCalls).toEqual([["wrappedGift", "🎁"]]);
    controller.setView("details", false);
    controller.focusInitialAction();
    expect(preview.focused).toBe(1);
  });
});
