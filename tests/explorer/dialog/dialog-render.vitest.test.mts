import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import {
  renderEmojiDialog,
  updateEmojiComposition,
  updateRenderingDiagnostic,
} from "../../../src/explorer/dialog/dialog-render.js";

class FakeClassList {
  classes = new Set<string>();

  add(name: string) {
    this.classes.add(name);
  }

  remove(name: string) {
    this.classes.delete(name);
  }

  toggle(name: string, force?: boolean) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : force;
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
  }

  contains(name: string) {
    return this.classes.has(name);
  }
}

class FakeElement {
  tagName: string;
  className = "";
  id = "";
  hidden = false;
  title = "";
  type?: string;
  dataset: Record<string, string | undefined> = {};
  attributes = new Map<string, string>();
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  textContent: string | null = "";
  classList = new FakeClassList();

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get innerText() {
    return this.textContent ?? "";
  }

  set innerText(value: string) {
    this.textContent = value;
  }

  append(...nodes: unknown[]) {
    for (const node of nodes) {
      if (node instanceof FakeElement) {
        node.parent = this;
        this.children.push(node);
        continue;
      }
      if (typeof node === "string") {
        const text = new FakeElement("#text");
        text.textContent = node;
        text.parent = this;
        this.children.push(text);
      }
    }
  }

  replaceChildren(...nodes: unknown[]) {
    this.children = [];
    this.append(...nodes);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "id") this.id = value;
    if (name === "aria-label") this.attributes.set(name, value);
    if (name.startsWith("data-")) this.dataset[name.slice(5)] = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  querySelector(selector: string): FakeElement | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const selectors = selector.split(",").map((part) => part.trim());
    const matchesSimpleSelector = (
      element: FakeElement,
      currentSelector: string,
    ) => {
      if (currentSelector.startsWith(".")) {
        return element.className.split(/\s+/).includes(currentSelector.slice(1));
      }
      return false;
    };
    const matches = (element: FakeElement, currentSelector: string) => {
      const parts = currentSelector.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return false;
      if (!matchesSimpleSelector(element, parts.at(-1)!)) return false;
      let ancestor = element.parent;
      for (let index = parts.length - 2; index >= 0; index -= 1) {
        const selectorPart = parts[index]!;
        while (ancestor && !matchesSimpleSelector(ancestor, selectorPart)) {
          ancestor = ancestor.parent;
        }
        if (!ancestor) return false;
        ancestor = ancestor.parent;
      }
      return true;
    };
    const results: FakeElement[] = [];
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (selectors.some((selectorPart) => matches(current, selectorPart))) {
        results.push(current);
      }
      stack.unshift(...current.children);
    }
    return results;
  }

  closest(selector: string) {
    const selectors = selector.split(",").map((part) => part.trim());
    let current: FakeElement | null = this;
    while (current) {
      if (
        selectors.some((selectorPart) => {
          if (selectorPart.startsWith(".")) {
            return current!.className.split(/\s+/).includes(selectorPart.slice(1));
          }
          return selectorPart.toLowerCase() === current!.tagName.toLowerCase();
        })
      ) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }
}

class FakeDocument {
  roots: FakeElement[] = [];
  documentElement = { lang: "en", dir: "ltr" };

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  register(...elements: FakeElement[]) {
    this.roots.push(...elements);
  }

  getElementsByClassName(name: string) {
    const results: FakeElement[] = [];
    const stack = [...this.roots];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (current.className.split(/\s+/).includes(name)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }

  getElementById(id: string) {
    const stack = [...this.roots];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (current.id === id) return current;
      stack.unshift(...current.children);
    }
    return null;
  }
}

describe("dialog-render", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      delete (globalThis as any).document;
    }
  });

  it("renders dialog composition, diagnostics, and localization details", () => {
    const documentStub = new FakeDocument();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: documentStub,
    });

    const exampleDialog = new FakeElement("dialog");
    const compositionSection = new FakeElement("section");
    compositionSection.className = "emoji-composition";
    const equation = new FakeElement("div");
    equation.className = "emoji-composition-equation";
    const modeButton = new FakeElement("button");
    modeButton.className = "emoji-composition-mode";
    compositionSection.append(equation, modeButton);

    const diagnosticSection = new FakeElement("section");
    diagnosticSection.className = "rendering-diagnostic";
    const systemGlyph = new FakeElement("span");
    systemGlyph.className = "system-render-glyph";
    const pixelGlyph = new FakeElement("span");
    pixelGlyph.className = "pixel-render-glyph";
    const renderingResult = new FakeElement("p");
    renderingResult.className = "rendering-result";
    diagnosticSection.append(systemGlyph, pixelGlyph, renderingResult);

    const invitation = new FakeElement("section");
    invitation.className = "pixel-design-invitation";
    const copyActions = new FakeElement("div");
    copyActions.className = "emoji-copy-actions";
    const regularEditorButton = new FakeElement("button");
    regularEditorButton.className = "show-pixel-editor";
    copyActions.append(regularEditorButton);

    exampleDialog.append(
      compositionSection,
      diagnosticSection,
      invitation,
      copyActions,
    );

    const emojiGroup = new FakeElement("div");
    emojiGroup.className = "emoji-group";
    const emojiSubgroup = new FakeElement("div");
    emojiSubgroup.className = "emoji-subgroup";
    const emojiKey = new FakeElement("div");
    emojiKey.className = "emoji-key";
    const emojiValue = new FakeElement("div");
    emojiValue.className = "emoji-value";
    const emojiEncoded = new FakeElement("div");
    emojiEncoded.className = "emoji-encoded";
    const previewGlyph = new FakeElement("div");
    previewGlyph.className = "emoji-preview-glyph";
    const englishNameRow = new FakeElement("div");
    englishNameRow.className = "emoji-english-name-row";
    const englishName = new FakeElement("div");
    englishName.className = "emoji-english-name";
    englishNameRow.append(englishName);
    const emojiVersion = new FakeElement("div");
    emojiVersion.className = "emoji-version";
    const emojiSequenceType = new FakeElement("div");
    emojiSequenceType.className = "emoji-sequence-type";
    const emojiStatus = new FakeElement("div");
    emojiStatus.className = "emoji-status";
    const localizedDetails = new FakeElement("section");
    localizedDetails.className = "localized-emoji-details";
    const localizedLanguage = new FakeElement("div");
    localizedLanguage.className = "localized-language";
    const localizedKeywords = new FakeElement("div");
    localizedKeywords.className = "localized-keywords";
    localizedDetails.append(localizedLanguage, localizedKeywords);
    const exampleTitle = new FakeElement("h2");
    exampleTitle.id = "example-title";

    documentStub.register(
      exampleDialog,
      emojiGroup,
      emojiSubgroup,
      emojiKey,
      emojiValue,
      emojiEncoded,
      previewGlyph,
      englishNameRow,
      emojiVersion,
      emojiSequenceType,
      emojiStatus,
      localizedDetails,
      exampleTitle,
    );

    let appliedPixelKey = "";
    updateEmojiComposition({
      applyPixelArtworkClass: (element, emojiKeyArg) => {
        appliedPixelKey = emojiKeyArg;
        element.classList.add("has-pixel-art");
      },
      applyStandalonePixelArtwork: (element, emojiKeyArg) => {
        if (element && emojiKeyArg) element.dataset.pixelEmojiKey = emojiKeyArg;
      },
      byId: { womanTechnologist: { shortName: "woman technologist" } },
      developerMode: true,
      detailsVisible: true,
      dir: "ltr",
      emojiByKey: { womanTechnologist: "👩‍💻" },
      emojiKeyByCodePoints: new Map([["1F469 200D 1F4BB", "womanTechnologist"]]),
      exampleDialog: exampleDialog as any,
      item: {
        key: "womanTechnologist",
        shortName: "woman technologist",
        codePoints: "1F469 200D 1F4BB",
      },
      locale: "en",
      numberingSystem: undefined,
      searchAnnotations: { womanTechnologist: ["woman technologist", "coder"] },
      translate: (_key, fallback) => fallback,
      value: "👩‍💻",
      compositionMode: "condensed",
    });
    assert.equal(compositionSection.hidden, false);
    assert.equal(compositionSection.dataset.available, "true");
    assert.equal(modeButton.hidden, false);
    assert.equal(modeButton.textContent, "Show full sequence");
    assert.equal(modeButton.getAttribute("aria-pressed"), "false");
    assert.ok(equation.children.length > 0);
    assert.equal(appliedPixelKey, "womanTechnologist");

    const blankDialog = new FakeElement("dialog");
    updateEmojiComposition({
      applyPixelArtworkClass: () => {},
      applyStandalonePixelArtwork: () => {},
      byId: {},
      developerMode: true,
      detailsVisible: true,
      dir: "ltr",
      emojiByKey: {},
      emojiKeyByCodePoints: new Map(),
      exampleDialog: blankDialog as any,
      item: { key: "grin", codePoints: "1F600" },
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
      value: "😀",
      compositionMode: "full",
    });

    updateRenderingDiagnostic({
      developerMode: true,
      detailsVisible: true,
      emojiKey: "womanTechnologist",
      emojiValue: "👩‍💻",
      exampleDialog: exampleDialog as any,
      painted: true,
      privateUsePoint: 0xe001,
      systemEmojiAppearsSplit: () => true,
      translate: (_key, fallback) => fallback,
      byId: { womanTechnologist: { codePoints: "1F469 200D 1F4BB" } },
    });
    assert.equal(diagnosticSection.dataset.available, "true");
    assert.equal(invitation.dataset.available, "false");
    assert.equal(diagnosticSection.hidden, false);
    assert.equal(invitation.hidden, true);
    assert.equal(regularEditorButton.hidden, false);
    assert.equal(systemGlyph.textContent, "👩‍💻");
    assert.equal(pixelGlyph.textContent, String.fromCodePoint(0xe001));
    assert.equal(diagnosticSection.dataset.pixelEmojiKey, "womanTechnologist");
    assert.equal(renderingResult.classList.contains("is-warning"), true);
    assert.match(
      renderingResult.textContent ?? "",
      /Pixel Emoji keeps the sequence together/,
    );
    updateRenderingDiagnostic({
      developerMode: false,
      detailsVisible: true,
      emojiKey: "womanTechnologist",
      emojiValue: "👩‍💻",
      exampleDialog: exampleDialog as any,
      painted: true,
      privateUsePoint: 0xe001,
      systemEmojiAppearsSplit: () => false,
      translate: (_key, fallback) => fallback,
      byId: { womanTechnologist: { codePoints: "1F469 200D 1F4BB" } },
    });
    assert.equal(regularEditorButton.hidden, true);

    const noInvitationDialog = new FakeElement("dialog");
    updateRenderingDiagnostic({
      developerMode: true,
      detailsVisible: true,
      emojiKey: "grin",
      emojiValue: "😀",
      exampleDialog: noInvitationDialog as any,
      painted: false,
      systemEmojiAppearsSplit: () => false,
      translate: (_key, fallback) => fallback,
      byId: {},
    });

    let favoriteUpdates = 0;
    const renderingCalls: Array<[string, string]> = [];
    const compositionCalls: Array<[any, string]> = [];
    const dialogDisplay = renderEmojiDialog({
      annotations: ["هدية ملفوفة", "احتفال", "مفاجأة"],
      applyPixelArtworkClass: (element, key) => {
        if (element) {
          (element as any).dataset.pixelEmojiKey = key;
          (element as any).classList.add("has-pixel-art");
        }
      },
      applyStandalonePixelArtwork: () => {},
      byId: {
        wrappedGift: {
          shortName: "wrapped gift",
          codePoints: "1F381",
          sequenceType: "single",
          status: "fully-qualified",
        },
      },
      compositionMode: "condensed",
      currentEmojiKey: "wrappedGift",
      developerMode: true,
      dialogNavigationKeys: ["wrappedGift"],
      displayGroupName: (name) => `group:${name}`,
      displayUnicodeSubGroupName: (name) => `sub:${name}`,
      emojiByKey: { wrappedGift: "🎁" },
      exampleDialog: exampleDialog as any,
      getIntroducedVersion: () => "6.0",
      group: "Activities",
      id: "wrappedGift",
      item: {
        shortName: "wrapped gift",
        codePoints: "1F381",
        sequenceType: "single",
        status: "fully-qualified",
      },
      locale: "ar",
      numberingSystem: "arab",
      searchAnnotations: { wrappedGift: ["هدية ملفوفة", "احتفال", "مفاجأة"] },
      selectedSearchLocale: "ar",
      sequenceTranslationKeys: { single: "single" },
      sequenceTypeLabels: { single: "Single" },
      statusTranslationKeys: { "fully-qualified": "fullyQualified" },
      subGroup: "event",
      translate: (key, fallback) => `${key}:${fallback}`,
      updateFavoriteButton: () => {
        favoriteUpdates += 1;
      },
      updateRenderingDiagnostic: (emojiKeyArg, value) => {
        renderingCalls.push([emojiKeyArg, value]);
      },
      updateEmojiComposition: (itemArg, value) => {
        compositionCalls.push([itemArg, value]);
      },
      value: "🎁",
    });
    assert.equal(emojiGroup.innerText, "group:Activities");
    assert.equal(emojiSubgroup.innerText, "sub:event");
    assert.equal(emojiKey.innerText, "wrappedGift");
    assert.equal(emojiValue.innerText, "🎁");
    assert.equal(emojiEncoded.innerText, "\\u{1f381}");
    assert.equal(previewGlyph.innerText, "🎁");
    assert.equal(previewGlyph.dataset.pixelEmojiKey, "wrappedGift");
    assert.equal(englishName.innerText, "wrapped gift");
    assert.equal(emojiVersion.innerText, "6.0");
    assert.equal(emojiSequenceType.innerText, "single:Single");
    assert.equal(emojiStatus.innerText, "fullyQualified:fully-qualified");
    assert.equal(exampleTitle.innerText, "هدية ملفوفة");
    assert.equal(exampleTitle.title, "هدية ملفوفة");
    assert.equal(localizedDetails.hidden, false);
    assert.equal(localizedLanguage.innerText, "keywords:keywords");
    assert.equal(localizedKeywords.innerText, "احتفال · مفاجأة");
    assert.equal(englishNameRow.hidden, false);
    assert.equal(favoriteUpdates, 1);
    assert.deepEqual(renderingCalls, [["wrappedGift", "🎁"]]);
    assert.equal(compositionCalls.length, 1);
    assert.equal(dialogDisplay.copyValues.key, "wrappedGift");
    assert.equal(dialogDisplay.dialogTitle.title, "هدية ملفوفة");

    const nonLocalizedDisplay = renderEmojiDialog({
      annotations: [],
      applyPixelArtworkClass: () => {},
      applyStandalonePixelArtwork: () => {},
      byId: {
        grin: {
          shortName: "grinning face",
          codePoints: "1F600",
          sequenceType: "single",
          status: "fully-qualified",
        },
      },
      compositionMode: "full",
      currentEmojiKey: "grin",
      developerMode: false,
      dialogNavigationKeys: [],
      displayGroupName: (name) => name,
      displayUnicodeSubGroupName: (name) => name,
      emojiByKey: { grin: "😀" },
      exampleDialog: exampleDialog as any,
      getIntroducedVersion: () => "1.0",
      group: "Smileys & Emotion",
      id: "grin",
      item: {
        shortName: "grinning face",
        codePoints: "1F600",
        sequenceType: "single",
        status: "fully-qualified",
      },
      searchAnnotations: {},
      selectedSearchLocale: "",
      sequenceTranslationKeys: { single: "single" },
      sequenceTypeLabels: { single: "Single" },
      statusTranslationKeys: { "fully-qualified": "fullyQualified" },
      subGroup: "face-smiling",
      translate: (_key, fallback) => fallback,
      updateFavoriteButton: () => {},
      updateRenderingDiagnostic: () => {},
      updateEmojiComposition: () => {},
      value: "😀",
    });
    assert.equal(localizedDetails.hidden, true);
    assert.equal(englishNameRow.hidden, false);
    assert.equal(nonLocalizedDisplay.dialogTitle.showLocalized, false);
  });
});
