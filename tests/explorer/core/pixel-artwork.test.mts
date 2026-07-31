import assert from "node:assert/strict";
import { createPixelArtworkManager } from "../../../src/explorer/pixel-artwork.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeClassList {
  values = new Map<string, boolean>();

  toggle(name: string, value: boolean) {
    this.values.set(name, value);
  }
}

class FakeElement {
  classList = new FakeClassList();
  dataset: Record<string, string> = {};
  textContent = "";

  constructor(readonly name: string) {}
}

class FakeCanvasContext {
  font = "";
  measureText(value: string) {
    if (value === "😀") return { width: 10 };
    if (value === "✨‍🔥") return { width: 12 };
    return { width: value.length * 20 };
  }
}

try {
  const comparison = new FakeElement("comparison");
  const renderedA = new FakeElement("renderedA");
  renderedA.dataset.pixelEmojiKey = "sparkles";
  const renderedB = new FakeElement("renderedB");
  renderedB.dataset.pixelEmojiKey = "flag";
  const modifierGlyphs = {
    male: new FakeElement("male"),
    semantic: new FakeElement("semantic"),
    fallback: new FakeElement("fallback"),
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        if (tagName === "canvas") {
          return {
            getContext() {
              return new FakeCanvasContext();
            },
          };
        }
        return new FakeElement(tagName);
      },
      querySelector(selector: string) {
        if (selector === ".pixel-comparison-custom") return comparison;
        return null;
      },
      querySelectorAll(selector: string) {
        if (selector === "[data-pixel-emoji-key]") return [renderedA, renderedB];
        return [];
      },
    },
  });

  const diagnostics: any[] = [];
  let refreshed = 0;
  let pixelPreferred = false;
  const manager = createPixelArtworkManager({
    byId: () => ({
      sparkles: {
        codePoints: "2728 200D 1F525",
        emoji: "✨‍🔥",
      },
      flag: {
        codePoints: "1F3F4 E0067 E0062 E007F",
        emoji: "🏴",
      },
    }),
    emojiByKey: () => ({
      sparkles: "✨‍🔥",
      flag: "🏴",
    }),
    emojiKeyByCodePoints: () =>
      new Map([
        ["1F3FB", "lightSkinTone"],
        ["1F3FB FE0F", "lightSkinToneVariant"],
      ]),
    genderCheckboxes: () => [
      {
        value: "male",
        closest() {
          return {
            querySelector() {
              return modifierGlyphs.male;
            },
          };
        },
      },
      {
        value: "1F3FB",
        closest() {
          return {
            querySelector() {
              return modifierGlyphs.fallback;
            },
          };
        },
      },
    ],
    hairCheckboxes: () => [],
    normalizeCodePoints: (value: string) => value.trim().toUpperCase(),
    pixelFontPreferred: () => pixelPreferred,
    refreshEditor() {
      refreshed += 1;
    },
    skinToneCheckboxes: () => [
      {
        value: "1F9B0",
        closest() {
          return {
            querySelector() {
              return modifierGlyphs.semantic;
            },
          };
        },
      },
    ],
    updateRenderingDiagnostic(payload: any) {
      diagnostics.push(payload);
    },
  });

  manager.updatePixelArtworkManifest({
    fields: ["key", "privateUseCodePoint", "releaseStatus"],
    glyphs: [
      ["sparkles", "E001", "released"],
      ["flag", "E002", "proposed"],
      ["grinningFace", "E003", "released"],
      ["personRedHair", undefined, "released"],
      ["lightSkinTone", undefined, "released"],
      ["lightSkinToneVariant", undefined, "released"],
      ["man", undefined, "released"],
    ],
  });
  assert.equal(comparison.dataset.pixelEmojiKey, "grinningFace");

  const target = new FakeElement("target");
  manager.applyPixelArtworkClass(target as any, "sparkles");
  assert.equal(target.classList.values.get("has-pixel-art"), true);
  assert.equal(target.classList.values.get("has-proposed-pixel-art"), false);
  assert.equal(target.dataset.pixelEmojiKey, "sparkles");
  assert.equal(target.textContent, "✨‍🔥");

  pixelPreferred = true;
  manager.applyPixelArtworkClass(target as any, "sparkles");
  assert.equal(target.textContent, String.fromCodePoint(0xe001));

  manager.applyPixelArtworkClass(target as any, "flag");
  assert.equal(target.classList.values.get("has-proposed-pixel-art"), true);
  assert.equal(target.textContent, String.fromCodePoint(0xe002));

  manager.applyPixelArtworkClass(target as any, "");
  assert.equal(target.classList.values.get("has-pixel-art"), false);
  assert.equal("pixelEmojiKey" in target.dataset, false);

  assert.equal(manager.renderedPixelEmoji("sparkles"), String.fromCodePoint(0xe001));
  assert.equal(manager.systemEmojiAppearsSplit("😀😀"), true);
  assert.equal(manager.systemEmojiAppearsSplit("✨‍🔥"), false);

  manager.updateRenderingDiagnostic("sparkles", "✨‍🔥");
  assert.equal(diagnostics[0].emojiKey, "sparkles");
  assert.equal(diagnostics[0].painted, true);
  assert.equal(diagnostics[0].privateUsePoint, 0xe001);

  manager.refreshRenderedPixelEmoji();
  assert.equal(refreshed, 1);
  assert.equal(renderedA.dataset.pixelEmojiKey, "sparkles");
  assert.equal(renderedB.dataset.pixelEmojiKey, "flag");

  manager.updateModifierPixelArtwork();
  assert.equal(modifierGlyphs.semantic.dataset.pixelEmojiKey, "personRedHair");
  assert.equal(modifierGlyphs.fallback.dataset.pixelEmojiKey, "lightSkinTone");
  assert.equal(modifierGlyphs.male.dataset.pixelEmojiKey, "man");
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
