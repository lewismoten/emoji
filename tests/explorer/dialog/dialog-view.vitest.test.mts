import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyDialogView,
  createEmojiDialogViewController,
  loadStylesheet,
} from "../../../src/explorer/dialog/dialog-view.js";
import * as state from "../../../src/state.js";

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
  focused: Array<unknown> = [];
  id = "";
  rel = "";
  href = "";
  sheet: unknown = undefined;
  listeners = new Map<string, Array<(event?: unknown) => void>>();

  querySelector<T = FakeElement>(selector: string) {
    return (this.selectors.get(selector) ?? null) as T | null;
  }

  addEventListener(type: string, listener: (event?: unknown) => void) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  dispatch(type: string, event?: unknown) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  focus(options?: unknown) {
    this.focused.push(options);
  }
}

class FakeDocument {
  head = {
    appended: [] as FakeElement[],
    appendChild: (node: FakeElement) => this.head.appended.push(node),
  };
  byId = new Map<string, FakeElement>();

  createElement() {
    return new FakeElement();
  }

  getElementById(id: string) {
    return this.byId.get(id) ?? null;
  }
}

function createDialogSkeleton() {
  const dialog = new FakeElement();
  const details = new FakeElement();
  const metadata = new FakeElement();
  const copyActions = new FakeElement();
  const codeView = new FakeElement();
  const composition = new FakeElement();
  const diagnostic = new FakeElement();
  const invitation = new FakeElement();
  const eyebrow = new FakeElement();
  const modeBack = new FakeElement();
  const preview = new FakeElement();
  const codeCopy = new FakeElement();

  composition.dataset.available = "true";
  diagnostic.dataset.available = "false";
  invitation.dataset.available = "true";

  dialog.selectors.set(".emoji-dialog-details", details);
  dialog.selectors.set(".emoji-metadata", metadata);
  dialog.selectors.set(".emoji-copy-actions", copyActions);
  dialog.selectors.set(".emoji-code-view", codeView);
  dialog.selectors.set(".emoji-composition", composition);
  dialog.selectors.set(".rendering-diagnostic", diagnostic);
  dialog.selectors.set(".pixel-design-invitation", invitation);
  dialog.selectors.set(".emoji-dialog-eyebrow", eyebrow);
  dialog.selectors.set(".dialog-mode-back", modeBack);
  dialog.selectors.set(".emoji-preview", preview);
  dialog.selectors.set('[data-copy="code"]', codeCopy);

  return {
    codeCopy,
    codeView,
    composition,
    copyActions,
    details,
    diagnostic,
    dialog,
    eyebrow,
    invitation,
    metadata,
    modeBack,
    preview,
  };
}

describe("dialog-view", () => {
  const originalDocument = globalThis.document;
  const originalQueueMicrotask = globalThis.queueMicrotask;

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    globalThis.queueMicrotask = originalQueueMicrotask;
    state.emojiByKey.clear();
    state.byId.clear();
    vi.restoreAllMocks();
  });

  it("normalizes requested modes and toggles dialog sections", () => {
    const {
      codeView,
      composition,
      copyActions,
      details,
      diagnostic,
      dialog,
      eyebrow,
      invitation,
      metadata,
    } = createDialogSkeleton();

    expect(
      applyDialogView({
        developerMode: true,
        fullDeveloperMode: true,
        dialog: dialog as any,
        requestedMode: false,
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "details", showDetails: true });
    expect(details.hidden).toBe(false);
    expect(metadata.hidden).toBe(false);
    expect(copyActions.hidden).toBe(false);
    expect(codeView.hidden).toBe(true);
    expect(composition.hidden).toBe(false);
    expect(invitation.hidden).toBe(false);
    expect(diagnostic.hidden).toBe(true);
    expect(eyebrow.dataset.i18n).toBe("emojiDetails");
    expect(eyebrow.textContent).toBe("Emoji details:emojiDetails");

    expect(
      applyDialogView({
        developerMode: false,
        fullDeveloperMode: false,
        dialog: dialog as any,
        requestedMode: true,
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "details", showDetails: true });

    expect(
      applyDialogView({
        developerMode: true,
        fullDeveloperMode: false,
        dialog: dialog as any,
        requestedMode: "code",
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "code", showDetails: false });
    expect(dialog.classList.contains("is-code-view")).toBe(true);
    expect(codeView.hidden).toBe(false);
    expect(details.hidden).toBe(true);
    expect(composition.hidden).toBe(true);
    expect(invitation.hidden).toBe(true);
    expect(eyebrow.dataset.i18n).toBe("codeExample");

    expect(
      applyDialogView({
        developerMode: true,
        fullDeveloperMode: false,
        dialog: dialog as any,
        requestedMode: "editor",
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "details", showDetails: true });

    diagnostic.dataset.available = "true";
    expect(
      applyDialogView({
        developerMode: true,
        fullDeveloperMode: true,
        dialog: dialog as any,
        requestedMode: "editor",
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "editor", showDetails: false });
    expect(dialog.classList.contains("is-editor-view")).toBe(true);
    expect(invitation.hidden).toBe(true);
    expect(diagnostic.hidden).toBe(true);
    expect(eyebrow.dataset.i18n).toBe("pixelEditor");

    expect(
      applyDialogView({
        developerMode: false,
        fullDeveloperMode: false,
        dialog: dialog as any,
        requestedMode: "nonsense",
        translate: (key, fallback) => `${fallback}:${key}`,
      }),
    ).toEqual({ mode: "details", showDetails: true });
  });

  it("loads stylesheets from existing, pending, new, and error states", async () => {
    const fakeDocument = new FakeDocument();
    (globalThis as any).document = fakeDocument;

    const loadedLink = new FakeElement();
    loadedLink.id = "sheet-loaded";
    loadedLink.sheet = {};
    fakeDocument.byId.set("sheet-loaded", loadedLink);
    await expect(loadStylesheet("/loaded.css", "sheet-loaded")).resolves.toBe(
      loadedLink,
    );

    const pendingLink = new FakeElement();
    pendingLink.id = "sheet-pending";
    fakeDocument.byId.set("sheet-pending", pendingLink);
    const pendingPromise = loadStylesheet("/pending.css", "sheet-pending");
    pendingLink.dispatch("load");
    await expect(pendingPromise).resolves.toBe(pendingLink);

    const createdPromise = loadStylesheet("/new.css", "sheet-new");
    const createdLink = fakeDocument.head.appended[0]!;
    expect(createdLink.id).toBe("sheet-new");
    expect(createdLink.rel).toBe("stylesheet");
    expect(createdLink.href).toBe("/new.css");
    createdLink.dispatch("load");
    await expect(createdPromise).resolves.toBe(createdLink);

    const failingPromise = loadStylesheet("/broken.css", "sheet-broken");
    const failingLink = fakeDocument.head.appended[1]!;
    const error = new Error("broken");
    failingLink.dispatch("error", error);
    await expect(failingPromise).rejects.toBe(error);
  });

  it("controls dialog view transitions, code refreshes, editor setup, and focus targets", async () => {
    const { codeCopy, dialog, modeBack, preview } = createDialogSkeleton();
    (dialog as any).open = true;
    state.emojiByKey.replace({ wrappedGift: "🎁", partyPopper: "🎉" });
    state.byId.replace({
      partyPopper: { key: "partyPopper" } as any,
      wrappedGift: { key: "wrappedGift" } as any,
    });

    const parent = new FakeElement();
    const updateImportExamples = vi.fn();
    const updateCompositionBackButton = vi.fn();
    const syncUrlState = vi.fn();
    const loadPackageManifest = vi.fn(async () => ({}));
    globalThis.queueMicrotask = ((callback: () => void) => callback()) as any;

    let currentKey = "wrappedGift";
    let editor: any = {
      element: new FakeElement(),
      open: vi.fn(),
    };
    const ensurePixelEditor = vi.fn(async () => undefined);

    const controller = createEmojiDialogViewController({
      currentDialogParentStack: () => ["favorites"],
      currentEmojiKey: () => currentKey,
      developerModeEnabled: () => true,
      dialog: () => dialog as any,
      emojiParent: () => parent as any,
      ensurePixelEditor,
      fullDeveloperModeEnabled: () => true,
      getPixelEditor: () => editor,
      loadPackageManifest,
      syncUrlState,
      translate: (key, fallback) => `${fallback}:${key}`,
      updateCompositionBackButton,
      updateImportExamples,
    });

    controller.setView("code");
    await Promise.resolve();
    expect(updateImportExamples).toHaveBeenNthCalledWith(1, {
      key: "wrappedGift",
    });
    expect(loadPackageManifest).toHaveBeenCalledTimes(1);
    expect(updateImportExamples).toHaveBeenNthCalledWith(2, {
      key: "wrappedGift",
    });
    expect(modeBack.hidden).toBe(false);
    expect(syncUrlState).toHaveBeenCalledTimes(1);
    controller.focusInitialAction();
    expect(codeCopy.focused).toEqual([{ preventScroll: true }]);

    controller.setView("details", false);
    expect(dialog.dataset.dialogParentPanel).toBe("favorites");
    expect(parent.hidden).toBe(false);
    expect(updateCompositionBackButton).toHaveBeenCalledTimes(2);
    expect(modeBack.hidden).toBe(true);
    controller.focusInitialAction();
    expect(preview.focused).toEqual([{ preventScroll: true }]);
    expect(syncUrlState).toHaveBeenCalledTimes(1);

    currentKey = "partyPopper";
    editor = {
      element: new FakeElement(),
      open: vi.fn(),
    };
    controller.setView("editor");
    expect(editor.element.hidden).toBe(false);
    expect(editor.open).toHaveBeenCalledWith("partyPopper", "🎉");
    expect(syncUrlState).toHaveBeenCalledTimes(2);

    editor = undefined;
    controller.setView("editor");
    expect(ensurePixelEditor).toHaveBeenCalledTimes(1);
    expect(syncUrlState).toHaveBeenCalledTimes(3);
  });

  it("skips refresh work when keys or dialog state no longer match", async () => {
    const { dialog } = createDialogSkeleton();
    (dialog as any).open = false;
    state.emojiByKey.replace({ wrappedGift: "🎁" });
    state.byId.replace({ wrappedGift: { key: "wrappedGift" } as any });

    const updateImportExamples = vi.fn();
    const loadPackageManifest = vi.fn(async () => ({}));
    const syncUrlState = vi.fn();
    globalThis.queueMicrotask = ((callback: () => void) => callback()) as any;

    let currentKey = "wrappedGift";
    const controller = createEmojiDialogViewController({
      currentDialogParentStack: () => [],
      currentEmojiKey: () => currentKey,
      developerModeEnabled: () => true,
      dialog: () => dialog as any,
      emojiParent: () => undefined,
      ensurePixelEditor: async () => undefined,
      getPixelEditor: () => undefined,
      loadPackageManifest,
      syncUrlState,
      translate: (key, fallback) => `${fallback}:${key}`,
      updateCompositionBackButton: vi.fn(),
      updateImportExamples,
    });

    controller.setView("code");
    currentKey = "";
    await Promise.resolve();
    expect(updateImportExamples).toHaveBeenCalledTimes(1);
    expect(syncUrlState).not.toHaveBeenCalled();

    controller.setView("details");
    expect(dialog.dataset.dialogParentPanel).toBe("");
  });
});
