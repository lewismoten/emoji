import { afterEach, describe, expect, it } from "vitest";

import * as state from "../../src/state.js";
import { createPixelArtworkManager } from "../../src/explorer/pixel-artwork.js";

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

describe("pixel-artwork", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    state.byId.replace({});
    state.emojiByKey.replace({});
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("manages rendered pixel emoji, diagnostics, and modifier artwork", () => {
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

    state.byId.replace({
      flag: {
        codePoints: "1F3F4 E0067 E0062 E007F",
        emoji: "🏴",
      } as any,
      sparkles: {
        codePoints: "2728 200D 1F525",
        emoji: "✨‍🔥",
      } as any,
    });
    state.emojiByKey.replace({
      flag: "🏴",
      sparkles: "✨‍🔥",
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
    expect(comparison.dataset.pixelEmojiKey).toBe("grinningFace");

    const target = new FakeElement("target");
    manager.applyPixelArtworkClass(target as any, "sparkles");
    expect(target.classList.values.get("has-pixel-art")).toBe(true);
    expect(target.classList.values.get("has-proposed-pixel-art")).toBe(false);
    expect(target.dataset.pixelEmojiKey).toBe("sparkles");
    expect(target.textContent).toBe("✨‍🔥");

    pixelPreferred = true;
    manager.applyPixelArtworkClass(target as any, "sparkles");
    expect(target.textContent).toBe(String.fromCodePoint(0xe001));

    manager.applyPixelArtworkClass(target as any, "flag");
    expect(target.classList.values.get("has-proposed-pixel-art")).toBe(true);
    expect(target.textContent).toBe(String.fromCodePoint(0xe002));

    manager.applyPixelArtworkClass(target as any, "");
    expect(target.classList.values.get("has-pixel-art")).toBe(false);
    expect("pixelEmojiKey" in target.dataset).toBe(false);

    expect(manager.renderedPixelEmoji("sparkles")).toBe(String.fromCodePoint(0xe001));
    expect(manager.systemEmojiAppearsSplit("😀😀")).toBe(true);
    expect(manager.systemEmojiAppearsSplit("✨‍🔥")).toBe(false);

    manager.updateRenderingDiagnostic("sparkles", "✨‍🔥");
    expect(diagnostics[0].emojiKey).toBe("sparkles");
    expect(diagnostics[0].painted).toBe(true);
    expect(diagnostics[0].privateUsePoint).toBe(0xe001);

    manager.refreshRenderedPixelEmoji();
    expect(refreshed).toBe(1);
    expect(renderedA.dataset.pixelEmojiKey).toBe("sparkles");
    expect(renderedB.dataset.pixelEmojiKey).toBe("flag");

    manager.updateModifierPixelArtwork();
    expect(modifierGlyphs.semantic.dataset.pixelEmojiKey).toBe("personRedHair");
    expect(modifierGlyphs.fallback.dataset.pixelEmojiKey).toBe("lightSkinTone");
    expect(modifierGlyphs.male.dataset.pixelEmojiKey).toBe("man");
  });
});
