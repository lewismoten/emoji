import assert from "node:assert/strict";
import {
  applyDialogView,
  createEmojiDialogViewController,
  loadStylesheet,
} from "../../../src/explorer/dialog/dialog-view.js";

class FakeClassList {
  names = new Set<string>();

  toggle(name: string, force?: boolean) {
    if (force === true) this.names.add(name);
    else if (force === false) this.names.delete(name);
    else if (this.names.has(name)) this.names.delete(name);
    else this.names.add(name);
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
  head = {
    appended: [] as FakeElement[],
    appendChild: (node: FakeElement) => {
      this.head.appended.push(node);
    },
  };
  byId = new Map<string, FakeElement>();

  createElement(tagName: string) {
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

let translated: Array<[string, string]> = [];
const detailsResult = applyDialogView({
  developerMode: true,
  dialog: detailsDialog as unknown as HTMLElement,
  requestedMode: false,
  translate: (key, fallback) => {
    translated.push([key, fallback]);
    return `${fallback}:${key}`;
  },
});
assert.deepEqual(detailsResult, { mode: "details", showDetails: true });
assert.equal(details.hidden, false);
assert.equal(metadata.hidden, false);
assert.equal(copyActions.hidden, false);
assert.equal(codeView.hidden, true);
assert.equal(composition.hidden, false);
assert.equal(diagnostic.hidden, true);
assert.equal(invitation.hidden, false);
assert.equal(eyebrow.dataset.i18n, "emojiDetails");
assert.equal(eyebrow.textContent, "Emoji details:emojiDetails");

translated = [];
const codeResult = applyDialogView({
  developerMode: false,
  dialog: detailsDialog as unknown as HTMLElement,
  requestedMode: true,
  translate: (key, fallback) => {
    translated.push([key, fallback]);
    return `${fallback}:${key}`;
  },
});
assert.deepEqual(codeResult, { mode: "details", showDetails: true });
assert.equal(eyebrow.dataset.i18n, "emojiDetails");

const editorResult = applyDialogView({
  developerMode: true,
  dialog: detailsDialog as unknown as HTMLElement,
  requestedMode: "editor",
  translate: (key, fallback) => `${fallback}:${key}`,
});
assert.deepEqual(editorResult, { mode: "editor", showDetails: false });
assert.equal(detailsDialog.classList.contains("is-editor-view"), true);
assert.equal(details.hidden, true);
assert.equal(codeView.hidden, true);
assert.equal(composition.hidden, true);
assert.equal(eyebrow.dataset.i18n, "pixelEditor");

const originalDocument = globalThis.document;
const fakeDocument = new FakeDocument();
(globalThis as any).document = fakeDocument;

const loadedLink = new FakeElement();
loadedLink.id = "sheet-loaded";
loadedLink.sheet = {};
fakeDocument.byId.set("sheet-loaded", loadedLink);
const resolvedExisting = await loadStylesheet("/loaded.css", "sheet-loaded");
assert.equal(resolvedExisting, loadedLink);

const pendingLink = new FakeElement();
pendingLink.id = "sheet-pending";
fakeDocument.byId.set("sheet-pending", pendingLink);
const pendingPromise = loadStylesheet("/pending.css", "sheet-pending");
pendingLink.dispatch("load");
assert.equal(await pendingPromise, pendingLink);

const createdPromise = loadStylesheet("/new.css", "sheet-new");
assert.equal(fakeDocument.head.appended.length, 1);
const created = fakeDocument.head.appended[0];
assert.equal(created.id, "sheet-new");
assert.equal(created.rel, "stylesheet");
assert.equal(created.href, "/new.css");
created.dispatch("load");
assert.equal(await createdPromise, created);

const dialog = new FakeElement();
(dialog as any).open = true;
dialog.dataset.dialogParentPanel = "";
const modeBack = new FakeElement();
const preview = new FakeElement();
const codeCopy = new FakeElement();
dialog.selectors.set(".dialog-mode-back", modeBack);
dialog.selectors.set(".emoji-preview", preview);
dialog.selectors.set('[data-copy="code"]', codeCopy);
const parent = new FakeElement();
const updateImportCalls: unknown[] = [];
const syncCalls: number[] = [];
const updateBackCalls: number[] = [];
const editorOpenCalls: Array<[string, string]> = [];
const originalQueueMicrotask = globalThis.queueMicrotask;
globalThis.queueMicrotask = ((callback: () => void) => callback()) as typeof queueMicrotask;

let editor: any = {
  element: new FakeElement(),
  open(key: string, value: string) {
    editorOpenCalls.push([key, value]);
  },
};

const controller = createEmojiDialogViewController({
  byId: () => ({ wrappedGift: { key: "wrappedGift" } }),
  currentDialogParentStack: () => ["favorites"],
  currentEmojiKey: () => "wrappedGift",
  developerModeEnabled: () => true,
  dialog: () => dialog,
  emojiByKey: () => ({ wrappedGift: "🎁" }),
  emojiParent: () => parent as unknown as HTMLElement,
  ensurePixelEditor: async () => {
    syncCalls.push(99);
  },
  getPixelEditor: () => editor,
  loadPackageManifest: async () => ({}),
  syncUrlState: () => {
    syncCalls.push(1);
  },
  translate: (key, fallback) => `${fallback}:${key}`,
  updateCompositionBackButton: () => {
    updateBackCalls.push(1);
  },
  updateImportExamples: (item) => {
    updateImportCalls.push(item);
  },
});

controller.setView("details");
assert.equal(dialog.dataset.dialogParentPanel, "favorites");
assert.equal(modeBack.hidden, true);
assert.equal(parent.hidden, false);
assert.ok(updateBackCalls.length >= 2);

controller.setView("code");
await Promise.resolve();
assert.equal(dialog.classList.contains("is-code-view"), true);
assert.equal(modeBack.hidden, false);
assert.deepEqual(updateImportCalls, [{ key: "wrappedGift" }, { key: "wrappedGift" }]);

controller.focusInitialAction();
assert.equal(codeCopy.focused, 1);

controller.setView("editor");
assert.deepEqual(editorOpenCalls, [["wrappedGift", "🎁"]]);

editor = undefined;
controller.setView("editor");
assert.equal(syncCalls.includes(99), true);

controller.setView("details", false);
controller.focusInitialAction();
assert.equal(preview.focused, 1);

globalThis.queueMicrotask = originalQueueMicrotask;
(globalThis as any).document = originalDocument;
