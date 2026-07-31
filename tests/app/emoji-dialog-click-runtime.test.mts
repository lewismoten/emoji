import assert from "node:assert/strict";
import { createEmojiDialogClickRuntime } from "../../src/app/emoji/emoji-dialog-click-runtime.js";

type ClosestMap = Record<string, any>;

class FakeTarget {
  constructor(
    private closestMap: ClosestMap,
    private matchMap: Record<string, boolean> = {},
  ) {}

  closest(selector: string) {
    return this.closestMap[selector] ?? null;
  }

  matches(selector: string) {
    return this.matchMap[selector] ?? false;
  }
}

class FakeDialog {
  dataset: Record<string, string> = { dialogParentPanel: "favorites" };
  classList = {
    contains: (name: string) => name === "is-editor-view",
  };
  closed = 0;
  focusTargets = new Map<string, { focused: number; focus(): void }>();

  querySelector(selector: string) {
    return this.focusTargets.get(selector) ?? null;
  }

  close() {
    this.closed += 1;
  }
}

const originalWindow = globalThis.window;
(globalThis as any).window = {
  history: {
    state: {
      keep: true,
      compositionParent: "parentEmoji",
      dialogParentPanel: "favorites",
    },
    backCalled: 0,
    back() {
      this.backCalled += 1;
    },
  },
  location: { href: "https://example.test/emoji?x=1" },
};

const dialog = new FakeDialog();
const backButton = {
  focused: 0,
  focus() {
    this.focused += 1;
  },
};
const editorCanvas = {
  focused: 0,
  focus() {
    this.focused += 1;
  },
};
dialog.focusTargets.set(".dialog-mode-back:not([hidden])", backButton);
dialog.focusTargets.set(".pixel-editor-canvas", editorCanvas);

const syncUrlStateCalls: any[] = [];
const openPanelCalls: any[] = [];
const showEmojiCalls: any[] = [];
const copyCalls: any[] = [];
const copiedKeys: string[] = [];
const animated: any[] = [];
const setViewCalls: string[] = [];
const favoriteToggles: string[] = [];
const suppressCalls: boolean[] = [];
let compositionRefreshes = 0;
let compositionToggles = 0;
let updateBackCalls = 0;
let stackClears = 0;

const handler = createEmojiDialogClickRuntime({
  animateCopy: (button: unknown) => animated.push(button),
  byId: () => ({ wrappedGift: { key: "wrappedGift" } }),
  clearCurrentDialogParentStack: () => {
    stackClears += 1;
  },
  copy: async (value: string, message: string) => {
    copyCalls.push([value, message]);
    return true;
  },
  currentEmojiCopies: () => ({ emoji: "🎁", key: "wrappedGift" }),
  currentEmojiKey: () => "wrappedGift",
  dialog: () => dialog,
  emojiByKey: () => ({ wrappedGift: "🎁", partyPopper: "🎉" }),
  languageList: () => ({ id: "language-list" }),
  openPanel: (options: unknown) => openPanelCalls.push(options),
  panelDialogs: () => ({ help: {}, favorites: {} }),
  recordCopiedEmoji: (key: string) => copiedKeys.push(key),
  renderSavedEmoji: () => "rendered",
  setSuppressDialogCloseSync: (value: boolean) => suppressCalls.push(value),
  setView: (mode: string) => setViewCalls.push(mode),
  showEmoji: (key: string, openDialog: boolean) =>
    showEmojiCalls.push([key, openDialog]),
  syncUrlState: (...args: any[]) => syncUrlStateCalls.push(args),
  toggleComposition: () => {
    compositionToggles += 1;
  },
  toggleFavorite: (key: string) => favoriteToggles.push(key),
  translate: (_key: string, fallback: string) => fallback,
  updateCompositionBackButton: () => {
    updateBackCalls += 1;
  },
  updateEmojiComposition: () => {
    compositionRefreshes += 1;
  },
});

handler({
  target: new FakeTarget({
    ".emoji-parent": { id: "parent" },
  }),
} as unknown as MouseEvent);
assert.equal(dialog.closed, 1);
assert.equal(stackClears, 1);
assert.deepEqual(suppressCalls, [true, false]);
assert.equal(openPanelCalls.length, 1);
assert.deepEqual(syncUrlStateCalls[0], ["replace", { keep: true }]);

handler({
  target: new FakeTarget({
    "[data-composition-emoji]": {
      dataset: { compositionEmoji: "partyPopper" },
    },
  }),
} as unknown as MouseEvent);
assert.deepEqual(showEmojiCalls, [["partyPopper", false]]);
assert.deepEqual(syncUrlStateCalls[1], [
  "push",
  {
    keep: true,
    compositionParent: "wrappedGift",
    dialogParentPanel: "favorites",
    emojiDialogEntry: false,
  },
]);
assert.equal(updateBackCalls, 1);

handler({
  target: new FakeTarget({
    ".show-emoji-code": { id: "code-button" },
  }),
} as unknown as MouseEvent);
assert.deepEqual(setViewCalls[0], "code");
assert.equal(backButton.focused, 1);

handler({
  target: new FakeTarget({
    ".show-pixel-editor": { id: "editor-button" },
  }),
} as unknown as MouseEvent);
assert.deepEqual(setViewCalls[1], "editor");
assert.equal(editorCanvas.focused, 1);

handler({
  target: new FakeTarget({
    ".emoji-composition-mode": { id: "composition-mode" },
  }),
} as unknown as MouseEvent);
assert.equal(compositionToggles, 1);
assert.equal(compositionRefreshes, 1);
assert.deepEqual(syncUrlStateCalls.at(-1), []);

const previewButton = new FakeTarget({
  "[data-copy]": {
    dataset: { copy: "emoji" },
    matches: (selector: string) => selector === ".emoji-preview",
  },
});
handler({ target: previewButton } as unknown as MouseEvent);
await Promise.resolve();
assert.deepEqual(copyCalls[0], ["🎁", "Emoji copied to the clipboard."]);
assert.deepEqual(copiedKeys, ["wrappedGift"]);
assert.equal(animated.length, 1);

handler({
  target: new FakeTarget({
    ".toggle-favorite": { id: "favorite" },
  }),
} as unknown as MouseEvent);
assert.deepEqual(favoriteToggles, ["wrappedGift"]);

(globalThis as any).window = originalWindow;
