import assert from "node:assert/strict";
import { initializeDialogRuntime } from "../../../src/app/dialog/dialog-runtime.js";

class FakeClassList {
  constructor(private readonly containsValue = false) {}
  contains(_name: string) {
    return this.containsValue;
  }
}

class FakeElement {
  className = "";
  id = "";
  hidden = false;
  title = "";
  textContent = "";
  innerText = "";
  dataset: Record<string, string | undefined> = {};
  attributes = new Map<string, string>();

  constructor(className = "") {
    this.className = className;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  closest() {
    return this;
  }
}

function createDocumentStub(locale = "en") {
  const byClass = new Map<string, FakeElement[]>();
  const register = (className: string) => {
    const element = new FakeElement(className);
    byClass.set(className, [element]);
    return element;
  };
  const byId = new Map<string, FakeElement>();
  const registerId = (id: string) => {
    const element = new FakeElement();
    element.id = id;
    byId.set(id, element);
    return element;
  };

  const documentStub: any = {
    documentElement: { lang: locale },
    getElementsByClassName(name: string) {
      return byClass.get(name) ?? [];
    },
    getElementById(id: string) {
      return byId.get(id) ?? null;
    },
  };

  register("emoji-group");
  register("emoji-subgroup");
  register("emoji-key");
  register("emoji-value");
  register("emoji-encoded");
  register("emoji-preview-glyph");
  register("emoji-english-name");
  register("emoji-version");
  register("emoji-sequence-type");
  register("emoji-status");
  register("localized-emoji-details");
  register("localized-language");
  register("localized-keywords");
  registerId("example-title");

  return { documentStub, byClass, byId };
}

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const { documentStub, byClass } = createDocumentStub("en");
const windowStub: any = {
  history: {
    state: { compositionParent: "wrappedGift", dialogParentPanel: "help" },
  },
};
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});

try {
  const state: any = {
    byId: {
      wrappedGift: {
        shortName: "wrapped gift",
        codePoints: "1F381",
        sequenceType: "single",
        status: "fully-qualified",
      },
      wave: {
        shortName: "waving hand",
        codePoints: "1F44B",
        sequenceType: "single",
        status: "fully-qualified",
      },
    },
    compositionMode: "condensed",
    currentEmojiCopies: {},
    currentEmojiKey: "",
    currentDialogParentStack: [],
    dialogNavigationKeys: [],
    displayedKeys: ["smile", "wrappedGift", "wave"],
    emojiByKey: { wrappedGift: "🎁", wave: "👋", smile: "😀" },
    items: [
      { key: "wrappedGift", group: "Activities", unicodeSubGroup: "event" },
      {
        key: "wave",
        group: "People & Body",
        unicodeSubGroup: "hand-fingers-open",
      },
    ],
    searchAnnotations: { wrappedGift: ["gift", "present"] },
    selectedSearchLocale: "",
  };

  const dialog = {
    dataset: {} as Record<string, string>,
    classList: new FakeClassList(false),
    showModalCalls: 0,
    showModal() {
      this.showModalCalls += 1;
    },
  };
  const copyStatus = { textContent: "copied" };
  const emojiParent = {
    hidden: true,
    title: "",
    attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
    getAttribute(name: string) {
      return this.attributes.get(name) ?? null;
    },
  };
  const emojiPrevious = { disabled: false };
  const emojiNext = { disabled: false };
  const setDialogViewCalls: Array<[string, boolean]> = [];
  const syncCalls: Array<[string, any]> = [];
  let focusCalls = 0;
  let updateBackCalls = 0;
  let updateDialogNavigationCalls = 0;
  const openEditorCalls: Array<[string, string]> = [];

  const runtime = initializeDialogRuntime({
    applyPixelArtworkClass: () => {},
    applyStandalonePixelArtwork: () => {},
    byId: () => state.byId,
    copyStatus: () => copyStatus,
    currentDialogParentStack: () => state.currentDialogParentStack,
    currentEmojiKey: () => state.currentEmojiKey,
    developerModeEnabled: () => true,
    dialog: () => dialog as any,
    dialogNavigationKeys: () => state.dialogNavigationKeys,
    displayedKeys: () => state.displayedKeys,
    displayGroupName: (value: string) => `group:${value}`,
    displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
    emojiByKey: () => state.emojiByKey,
    emojiNext: () => emojiNext as any,
    emojiParent: () => emojiParent as any,
    emojiPrevious: () => emojiPrevious as any,
    focusInitialAction: () => {
      focusCalls += 1;
    },
    getIntroducedVersion: () => "6.0",
    openEditor: (key: string, value: string) => {
      openEditorCalls.push([key, value]);
    },
    searchAnnotations: () => state.searchAnnotations,
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeLabels: { single: "Single" },
    setCurrentDialogParentStack: (value: string[]) => {
      state.currentDialogParentStack = value;
    },
    setDialogView: (mode: string, preserve: boolean) => {
      setDialogViewCalls.push([mode, preserve]);
    },
    state: () => state,
    statusTranslationKeys: { "fully-qualified": "fullyQualified" },
    syncUrlState: (mode: string, nextState?: any) => {
      syncCalls.push([mode, nextState]);
    },
    translate: (_key: string, fallback: string) => fallback,
    updateCompositionBackButton: () => {
      updateBackCalls += 1;
    },
    updateDialogNavigation: () => {
      updateDialogNavigationCalls += 1;
    },
    updateEmojiComposition: () => {},
    updateFavoriteButton: () => {},
    updateRenderingDiagnostic: () => {},
  });

  assert.equal(typeof runtime.showEmoji, "function");
  assert.equal(typeof runtime.navigateEmoji, "function");
  assert.equal(typeof runtime.updateDialogNavigation, "function");
  assert.equal(typeof runtime.updateCompositionBackButton, "function");

  runtime.showEmoji(
    "wrappedGift",
    true,
    ["missing", "wrappedGift", "wave"],
    "code",
    "favorites",
  );
  assert.equal(copyStatus.textContent, "");
  assert.equal(dialog.dataset.dialogParentPanel, "favorites");
  assert.deepEqual(state.currentDialogParentStack, ["favorites"]);
  assert.deepEqual(setDialogViewCalls, [["code", false]]);
  assert.equal(dialog.showModalCalls, 1);
  assert.equal(focusCalls, 1);
  assert.equal(updateBackCalls, 1);
  assert.equal(updateDialogNavigationCalls, 1);
  assert.deepEqual(state.dialogNavigationKeys, ["wrappedGift", "wave"]);
  assert.equal(state.currentEmojiKey, "wrappedGift");
  assert.deepEqual(state.currentEmojiCopies, {
    emoji: "🎁",
    key: "wrappedGift",
    escape: "\\u{1f381}",
    codePoints: "U+1F381",
  });
  assert.deepEqual(syncCalls[0], [
    "push",
    {
      dialogParentPanel: "favorites",
      emojiDialogEntry: true,
    },
  ]);
  assert.equal(byClass.get("emoji-group")?.[0].innerText, "group:Activities");

  runtime.updateDialogNavigation();
  assert.equal(emojiPrevious.disabled, true);
  assert.equal(emojiNext.disabled, false);
  assert.equal(emojiParent.title, "Back to emoji: gift");

  state.currentEmojiKey = "wrappedGift";
  state.dialogNavigationKeys = ["wrappedGift", "wave"];
  runtime.navigateEmoji(1);
  assert.equal(state.currentEmojiKey, "wave");
  assert.equal(updateDialogNavigationCalls, 2);
  assert.deepEqual(syncCalls.at(-1), [undefined, undefined]);
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
