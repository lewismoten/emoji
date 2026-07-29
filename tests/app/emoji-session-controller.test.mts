import assert from "node:assert/strict";
import { createEmojiSessionController } from "../../src/app/emoji-session-controller.js";

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

  constructor(className = "") {
    this.className = className;
  }

  setAttribute() {}
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
  return { documentStub, byClass };
}

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const { documentStub, byClass } = createDocumentStub("en");
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
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
    },
    compositionMode: "condensed",
    currentEmojiCopies: {},
    currentEmojiKey: "before",
    currentDialogParentStack: ["stale"],
    dialogNavigationKeys: ["old"],
    displayedKeys: ["missing", "wrappedGift"],
    emojiByKey: { wrappedGift: "🎁" },
    items: [
      { key: "wrappedGift", group: "Activities", unicodeSubGroup: "event" },
    ],
    searchAnnotations: { wrappedGift: ["gift", "present"] },
    selectedSearchLocale: "en-GB",
  };

  const dialog = {
    classList: new FakeClassList(true),
  };
  const openDialogCalls: Array<[string, string]> = [];
  const openEditorCalls: Array<[string, string]> = [];
  let updateDialogNavigationCalls = 0;

  const controller = createEmojiSessionController({
    applyPixelArtworkClass: () => {},
    applyStandalonePixelArtwork: () => {},
    developerModeEnabled: () => false,
    dialog: () => dialog as any,
    displayGroupName: (value: string) => `group:${value}`,
    displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
    getIntroducedVersion: () => "6.0",
    openDialogAction: (mode: string, panel: string) => {
      openDialogCalls.push([mode, panel]);
    },
    openEditor: (key: string, value: string) => {
      openEditorCalls.push([key, value]);
    },
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeLabels: { single: "Single" },
    state: () => state,
    statusTranslationKeys: { "fully-qualified": "fullyQualified" },
    translate: (_key: string, fallback: string) => fallback,
    updateDialogNavigation: () => {
      updateDialogNavigationCalls += 1;
    },
    updateEmojiComposition: () => {},
    updateFavoriteButton: () => {},
    updateRenderingDiagnostic: () => {},
  });

  controller.showEmoji("missing");
  assert.equal(state.currentEmojiKey, "before");
  assert.equal(updateDialogNavigationCalls, 0);

  controller.showEmoji(
    "wrappedGift",
    false,
    ["missing", "wrappedGift"],
    "editor",
    "help",
  );
  assert.equal(state.currentEmojiKey, "wrappedGift");
  assert.deepEqual(state.dialogNavigationKeys, ["wrappedGift"]);
  assert.deepEqual(state.currentDialogParentStack, ["help"]);
  assert.deepEqual(state.currentEmojiCopies, {
    emoji: "🎁",
    key: "wrappedGift",
    escape: "\\u{1f381}",
    codePoints: "U+1F381",
  });
  assert.deepEqual(openDialogCalls, []);
  assert.deepEqual(openEditorCalls, [["wrappedGift", "🎁"]]);
  assert.equal(updateDialogNavigationCalls, 1);
  assert.equal(byClass.get("emoji-group")?.[0].innerText, "group:Activities");

  dialog.classList = new FakeClassList(false);
  controller.showEmoji("wrappedGift", true, undefined, "code", "favorites");
  assert.deepEqual(openDialogCalls, [["code", "favorites"]]);
  assert.equal(updateDialogNavigationCalls, 2);
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
}
