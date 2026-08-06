import assert from "node:assert/strict";
import { createDialogRuntimeConfig } from "../../../src/app/dialog/dialog-runtime-config.js";
import * as sharedState from "../../../src/state.js";

class FakeClassList {
  contains() {
    return false;
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

function createDocumentStub() {
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
    documentElement: { lang: "en" },
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
  return documentStub;
}

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: createDocumentStub(),
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: { history: { state: {} } },
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
    currentEmojiKey: "",
    currentDialogParentStack: [],
    dialogNavigationKeys: [],
    displayedKeys: ["wrappedGift"],
    emojiByKey: { wrappedGift: "🎁" },
    items: [
      { key: "wrappedGift", group: "Activities", unicodeSubGroup: "event" },
    ],
    searchAnnotations: { wrappedGift: ["gift"] },
    selectedSearchLocale: "",
  };
  sharedState.byId.replace(state.byId);
  sharedState.currentEmojiCopies.replace(state.currentEmojiCopies);
  sharedState.currentEmojiKey.set(state.currentEmojiKey);
  sharedState.currentDialogParentStack.set(state.currentDialogParentStack);
  sharedState.dialogNavigationKeys.set(state.dialogNavigationKeys);
  sharedState.displayedKeys.set(state.displayedKeys);
  sharedState.emojiByKey.replace(state.emojiByKey);
  sharedState.items.set(state.items);
  sharedState.searchAnnotations.replace(state.searchAnnotations);
  sharedState.selectedSearchLocale.set(state.selectedSearchLocale);
  const dialog = {
    dataset: {} as Record<string, string>,
    classList: new FakeClassList(),
    showModal() {},
  };
  const config = createDialogRuntimeConfig({
    applyPixelArtworkClass: () => {},
    applyStandalonePixelArtwork: () => {},
    copyStatus: () => ({ textContent: "" }),
    developerModeEnabled: () => true,
    dialog: () => dialog as any,
    displayGroupName: (value: string) => value,
    displayUnicodeSubGroupName: (value: string) => value,
    emojiNext: () => ({ disabled: false }) as any,
    emojiParent: () => ({ hidden: true, title: "", setAttribute() {} }) as any,
    emojiPrevious: () => ({ disabled: false }) as any,
    focusInitialAction: () => {},
    getIntroducedVersion: () => "6.0",
    openEditor: () => {},
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeLabels: { single: "Single" },
    setCurrentDialogParentStack: (value: string[]) => {
      state.currentDialogParentStack = value;
      sharedState.currentDialogParentStack.set(value);
    },
    setDialogView: () => {},
    statusTranslationKeys: { "fully-qualified": "fullyQualified" },
    syncUrlState: () => {},
    translate: (_key: string, fallback: string) => fallback,
    updateCompositionBackButton: () => {},
    updateDialogNavigation: () => {},
    updateEmojiComposition: () => {},
    updateFavoriteButton: () => {},
    updateRenderingDiagnostic: () => {},
  });
  assert.equal(typeof config.showEmoji, "function");
  assert.equal(typeof config.navigateEmoji, "function");
  assert.equal(typeof config.updateDialogNavigation, "function");
  assert.equal(typeof config.updateCompositionBackButton, "function");
  config.showEmoji("wrappedGift", false);
  assert.equal(sharedState.currentEmojiKey.get(), "wrappedGift");
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
