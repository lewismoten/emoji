import assert from "node:assert/strict";
import { createDialogViewRuntime } from "../../../src/app/dialog/dialog-view-runtime.js";

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
  focused = 0;
  textContent = "";
  selectors = new Map<string, FakeElement>();

  querySelector<T = FakeElement>(selector: string) {
    return (this.selectors.get(selector) ?? null) as T | null;
  }

  focus() {
    this.focused += 1;
  }
}

const originalQueueMicrotask = globalThis.queueMicrotask;
globalThis.queueMicrotask = ((callback: () => void) =>
  callback()) as typeof queueMicrotask;

const dialog = new FakeElement();
dialog.dataset.dialogParentPanel = "";
(dialog as any).open = true;
const details = new FakeElement();
const metadata = new FakeElement();
const copyActions = new FakeElement();
const codeView = new FakeElement();
const composition = new FakeElement();
composition.dataset.available = "true";
const diagnostic = new FakeElement();
diagnostic.dataset.available = "true";
const invitation = new FakeElement();
invitation.dataset.available = "false";
const eyebrow = new FakeElement();
const modeBack = new FakeElement();
const preview = new FakeElement();
const codeCopy = new FakeElement();
const pixelCanvas = new FakeElement();
const parent = new FakeElement();

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
dialog.selectors.set(".pixel-editor-canvas", pixelCanvas);

const updateImportExamplesCalls: unknown[] = [];
const syncUrlStateCalls: number[] = [];
const updateCompositionBackButtonCalls: number[] = [];
const editorOpenCalls: Array<[string, string]> = [];
let ensurePixelEditorCalls = 0;
let pixelEditor: any = {
  element: new FakeElement(),
  open(key: string, value: string) {
    editorOpenCalls.push([key, value]);
  },
};

const runtime = createDialogViewRuntime({
  byId: () => ({ wrappedGift: { key: "wrappedGift" } }),
  currentDialogParentStack: () => ["favorites"],
  currentEmojiKey: () => "wrappedGift",
  developerModeEnabled: () => true,
  dialog: () => dialog,
  emojiByKey: () => ({ wrappedGift: "🎁" }),
  emojiParent: () => parent,
  ensurePixelEditor: async () => {
    ensurePixelEditorCalls += 1;
  },
  getPixelEditor: () => pixelEditor,
  loadPackageManifest: async () => ({ ok: true }),
  syncUrlState: () => {
    syncUrlStateCalls.push(1);
  },
  translate: (key: string, fallback: string) => `${fallback}:${key}`,
  updateCompositionBackButton: () => {
    updateCompositionBackButtonCalls.push(1);
  },
  updateImportExamples: (item: unknown) => {
    updateImportExamplesCalls.push(item);
  },
});

runtime.setView("details");
assert.equal(dialog.dataset.dialogParentPanel, "favorites");
assert.equal(details.hidden, false);
assert.equal(metadata.hidden, false);
assert.equal(copyActions.hidden, false);
assert.equal(codeView.hidden, true);
assert.equal(composition.hidden, false);
assert.equal(invitation.hidden, true);
assert.equal(modeBack.hidden, true);
assert.equal(parent.hidden, false);
assert.equal(eyebrow.textContent, "Emoji details:emojiDetails");
assert.equal(syncUrlStateCalls.length, 1);

runtime.setView("code");
await Promise.resolve();
assert.equal(dialog.classList.contains("is-code-view"), true);
assert.equal(details.hidden, true);
assert.equal(codeView.hidden, false);
assert.equal(modeBack.hidden, false);
assert.deepEqual(updateImportExamplesCalls, [
  { key: "wrappedGift" },
  { key: "wrappedGift" },
]);
assert.equal(eyebrow.textContent, "Code example:codeExample");

runtime.focusInitialAction();
assert.equal(codeCopy.focused, 1);

runtime.setView("editor");
assert.equal(dialog.classList.contains("is-editor-view"), true);
assert.deepEqual(editorOpenCalls, [["wrappedGift", "🎁"]]);
assert.equal(pixelEditor.element.hidden, false);

pixelEditor = undefined;
runtime.setView("editor");
assert.equal(ensurePixelEditorCalls, 1);

runtime.setView("details", false);
runtime.focusInitialAction();
assert.equal(preview.focused, 1);
assert.ok(updateCompositionBackButtonCalls.length >= 2);

globalThis.queueMicrotask = originalQueueMicrotask;
