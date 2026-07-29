import assert from "node:assert/strict";
import { createEmojiActions } from "../../src/app/emoji-actions.js";

class FakeElement {
  id = "";
  focused = 0;
  dataset: Record<string, string> = {};
  textContent = "";
  closestMap: Record<string, any> = {};

  focus() {
    this.focused += 1;
  }

  closest(selector: string) {
    return this.closestMap[selector] ?? null;
  }
}

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalFetch = globalThis.fetch;

const documentRef: any = {
  documentElement: { lang: "en", dir: "ltr", dataset: {} },
  querySelector() {
    return null;
  },
};
(globalThis as any).document = documentRef;
(globalThis as any).window = {
  history: {
    state: { keep: true },
    backCalled: 0,
    back() {
      this.backCalled += 1;
    },
  },
  setTimeout(callback: () => void) {
    callback();
    return 1;
  },
  matchMedia() {
    return { matches: false };
  },
};
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    clipboard: {
      async writeText(value: string) {
        copiedValues.push(value);
      },
    },
  },
});

const manifest = {
  packs: [
    { id: "all", importPath: "@lewismoten/emoji/all" },
    {
      id: "popular",
      importPath: "@lewismoten/emoji/popular",
      keys: ["wrappedGift"],
    },
  ],
  categories: [
    {
      label: "Objects",
      importPath: "@lewismoten/emoji/categories/objects",
      subcategories: [
        {
          unicodeSubgroup: "money",
          importPath: "@lewismoten/emoji/categories/objects/money",
        },
      ],
    },
  ],
};

const state: any = {
  packageManifest: manifest,
  packageManifestPromise: undefined,
  versionKeys: new Map([
    ["17.0", new Set(["wrappedGift"])],
    ["18.0", new Set(["futureEmoji"])],
  ]),
  versionManifests: [{ version: "17.0" }],
  proposedVersionManifests: [{ version: "18.0" }],
  emojiByKey: { wrappedGift: "🎁" },
  items: [
    { key: "wrappedGift", codePoints: "1F381", status: "fully-qualified" },
    {
      key: "wrappedGiftCandidate",
      codePoints: "1F381",
      status: "minimally-qualified",
    },
    { key: "lightSkin", codePoints: "1F44D 1F3FB", status: "fully-qualified" },
  ],
  currentDialogParentStack: [] as string[],
  byId: {
    wrappedGift: {
      key: "wrappedGift",
      group: "Objects",
      unicodeSubGroup: "money",
    },
  },
  compositionMode: "full",
  searchAnnotations: {},
  selectedSearchLocale: "en",
};

const copiedValues: string[] = [];
const showEmojiCalls: any[] = [];
const syncUrlStateCalls: any[] = [];
const importExampleItems: any[] = [];
let currentView: any[] = [];

const dialog = {
  dataset: { dialogParentPanel: "" },
  classList: {
    contains() {
      return false;
    },
  },
  querySelector() {
    return null;
  },
};
const copyStatus = { textContent: "" };

(globalThis as any).fetch = async () => ({
  ok: true,
  async json() {
    return manifest;
  },
});

const actions = createEmojiActions({
  applyingUrlState: () => false,
  applyPixelArtworkClass: () => {},
  applyStandalonePixelArtwork: () => {},
  copyStatus: () => copyStatus,
  developerModeEnabled: () => true,
  dialog: () => dialog,
  normalizeCodePoints: (value: string) => value,
  showEmoji: (key: string, openDialog: boolean) =>
    showEmojiCalls.push([key, openDialog]),
  state: () => state,
  setDialogView: (...args: any[]) => {
    currentView = args;
  },
  suppressDialogCloseSync: () => false,
  syncUrlState: (...args: any[]) => syncUrlStateCalls.push(args),
  translate: (_key: string, fallback: string) => fallback,
  updateEmojiImportExamples: (item: any) => importExampleItems.push(item),
  updateEmojiComposition: () => {},
  urlStateReady: () => true,
});

const createActions = (overrides: Record<string, unknown> = {}) =>
  createEmojiActions({
    applyingUrlState: () => false,
    applyPixelArtworkClass: () => {},
    applyStandalonePixelArtwork: () => {},
    copyStatus: () => copyStatus,
    developerModeEnabled: () => true,
    dialog: () => dialog,
    normalizeCodePoints: (value: string) => value,
    showEmoji: (key: string, openDialog: boolean) =>
      showEmojiCalls.push([key, openDialog]),
    state: () => state,
    setDialogView: (...args: any[]) => {
      currentView = args;
    },
    suppressDialogCloseSync: () => false,
    syncUrlState: (...args: any[]) => syncUrlStateCalls.push(args),
    translate: (_key: string, fallback: string) => fallback,
    updateEmojiImportExamples: (item: any) => importExampleItems.push(item),
    updateEmojiComposition: () => {},
    urlStateReady: () => true,
    ...overrides,
  });

assert.equal(actions.getIntroducedVersion("wrappedGift"), "17.0");
assert.equal(actions.getIntroducedVersion("missing"), "—");

await actions.loadPackageManifest();
assert.equal(state.packageManifestPromise instanceof Promise, true);
assert.equal(state.packageManifest, manifest);

await actions.copyToClipboardValue("🎁", "Copied!");
assert.deepEqual(copiedValues, ["🎁"]);
assert.equal(copyStatus.textContent, "Copied!");

actions.updateEmojiImportExamples(state.byId.wrappedGift);
assert.deepEqual(importExampleItems, []);

const cell = new FakeElement();
cell.id = "wrappedGift";
const clickTarget = new FakeElement();
clickTarget.closestMap["[data-emoji-key]"] = cell;
actions.onClick({ target: clickTarget });
assert.equal(cell.focused, 1);
assert.deepEqual(showEmojiCalls, [["wrappedGift", true]]);

actions.rebuildEmojiCodePointLookup();
assert.equal(state.emojiKeyByCodePoints.get("1F381"), "wrappedGift");
assert.equal(state.emojiKeyByCodePoints.get("1F44D 1F3FB"), "lightSkin");
actions.updateEmojiComposition(state.byId.wrappedGift, "🎁");

const originalBackCalled = (globalThis as any).window.history.backCalled;
const originalSyncCalls = syncUrlStateCalls.length;

createActions({
  suppressDialogCloseSync: () => true,
}).onEmojiDialogClose();
assert.equal((globalThis as any).window.history.backCalled, originalBackCalled);
assert.equal(syncUrlStateCalls.length, originalSyncCalls);

createActions({
  urlStateReady: () => false,
}).onEmojiDialogClose();
assert.equal((globalThis as any).window.history.backCalled, originalBackCalled);
assert.equal(syncUrlStateCalls.length, originalSyncCalls);

createActions({
  applyingUrlState: () => true,
}).onEmojiDialogClose();
assert.equal((globalThis as any).window.history.backCalled, originalBackCalled);
assert.equal(syncUrlStateCalls.length, originalSyncCalls);

(globalThis as any).window.history.state = { emojiDialogEntry: true };
actions.onEmojiDialogClose();
assert.deepEqual(currentView, ["details", false]);
assert.deepEqual(state.currentDialogParentStack, []);
assert.equal(dialog.dataset.dialogParentPanel, "");
assert.equal((globalThis as any).window.history.backCalled, 1);

(globalThis as any).window.history.state = {
  keep: true,
  compositionParent: "wrappedGift",
  dialogParentPanel: "favorites",
};
actions.onEmojiDialogClose();
assert.deepEqual(syncUrlStateCalls.at(-1), ["replace", { keep: true }]);

(globalThis as any).document = originalDocument;
(globalThis as any).window = originalWindow;
if (originalNavigatorDescriptor) {
  Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
} else {
  delete (globalThis as any).navigator;
}
(globalThis as any).fetch = originalFetch;
