import { afterEach, describe, expect, it } from "vitest";

import * as preferences from "../../../src/preferences.js";
import {
  renderPixelFontToggle,
  selectEmojiFont,
} from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

describe("explorer-ui theme and font", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("renders font choices and updates the font preference", () => {
    const fixture = installExplorerUiFixture();
    try {
      const storage = new Map<string, string>();
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
          localStorage: {
            getItem(key: string) {
              return storage.get(key) ?? null;
            },
            setItem(key: string, value: string) {
              storage.set(key, value);
            },
          },
        },
      });
      preferences.init({});
      preferences.setString("mode", "developer");
      preferences.setString("theme", "base");
      preferences.setBoolean("pixelFont", true);

      const pixelChoiceInput = createElement();
      const systemChoiceInput = createElement();
      const pixelChoice = createElement({ emojiFont: "pixel" });
      const systemChoice = createElement({ emojiFont: "system" });
      pixelChoice.querySelector = () => pixelChoiceInput;
      systemChoice.querySelector = () => systemChoiceInput;
      (pixelChoice as any).isConnected = true;
      (systemChoice as any).isConnected = true;
      const originalDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
      );
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          documentElement: fixture.documentElement,
          querySelector(selector: string) {
            if (selector === 'meta[name="theme-color"]') return fixture.themeMeta;
            return null;
          },
          querySelectorAll(selector: string) {
            return selector === ".emoji-font-choice"
              ? [pixelChoice, systemChoice]
              : [];
          },
        },
      });

      const calls: string[] = [];

      renderPixelFontToggle({
        choices: () => [pixelChoice, systemChoice],
        refreshRenderedPixelEmoji: () => calls.push("refresh-pixel"),
      });
      expect(fixture.documentElement.dataset.emojiFont).toBe("system");
      expect(systemChoice.classList.active.has("is-active")).toBe(true);
      expect(systemChoiceInput.checked).toBe(true);
      expect(pixelChoiceInput.checked).toBe(false);
      expect(pixelChoiceInput.getAttribute("checked")).toBeNull();
      expect(calls).toEqual(["refresh-pixel"]);

      preferences.setBoolean("pixelFont", false);
      renderPixelFontToggle({
        choices: () => [pixelChoice, systemChoice],
        refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-off"),
      });
      expect(fixture.documentElement.dataset.emojiFont).toBeUndefined();
      expect(pixelChoice.classList.active.has("is-active")).toBe(true);
      expect(pixelChoiceInput.checked).toBe(true);
      expect(systemChoiceInput.checked).toBe(false);
      expect(systemChoiceInput.getAttribute("checked")).toBeNull();

      renderPixelFontToggle({
        choices: () => [],
        refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-empty"),
      });

      const selectorPixelChoice = createElement({ emojiFont: "system" });
      selectorPixelChoice.querySelector = () => null;
      const selectorDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
      );
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          documentElement: fixture.documentElement,
          querySelector() {
            return null;
          },
          querySelectorAll(selector: string) {
            return selector === ".emoji-font-choice" ? [selectorPixelChoice] : [];
          },
        },
      });
      renderPixelFontToggle({
        refreshRenderedPixelEmoji: () => calls.push("refresh-pixel-selector"),
      });
      expect(selectorPixelChoice.classList.active.has("is-active")).toBe(false);
      if (selectorDocument) {
        Object.defineProperty(globalThis, "document", selectorDocument);
      }

      selectEmojiFont(
        {
          renderPixelFontToggle: () => calls.push("rerender-font"),
        },
        {
          currentTarget: {
            blur: () => calls.push("blur-font"),
            dataset: { emojiFont: "system" },
          },
          detail: 1,
        },
      );
      expect(preferences.getBoolean("pixelFont")).toBe(false);

      selectEmojiFont(
        {
          renderPixelFontToggle: () => calls.push("rerender-font-no-blur"),
        },
        {
          currentTarget: {
            blur: () => calls.push("blur-font-never"),
            dataset: { emojiFont: "pixel" },
          },
          detail: 0,
        },
      );
      expect(calls.includes("blur-font-never")).toBe(false);

      selectEmojiFont(
        {
          renderPixelFontToggle: () => calls.push("rerender-font-pixel"),
        },
        {
          currentTarget: {
            blur: () => calls.push("blur-font-pixel"),
            dataset: { emojiFont: "pixel" },
          },
          detail: 2,
        },
      );
      expect(preferences.getBoolean("pixelFont")).toBe(true);
      expect(calls.includes("blur-font-pixel")).toBe(true);
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      }
    } finally {
      fixture.restore();
    }
  });
});
