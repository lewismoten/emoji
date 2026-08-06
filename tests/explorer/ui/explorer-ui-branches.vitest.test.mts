import { afterEach, describe, expect, it } from "vitest";

import * as preferences from "../../../src/preferences.js";
import {
  createDeveloperModeController,
  createExplorerUiController,
  selectEmojiFont,
} from "../../../src/explorer-ui.js";
import * as state from "../../../src/state.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

describe("explorer-ui branches", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  afterEach(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    state.developerModeUrlDismissed.set(false);
    state.explorerModeFromUrl.set(undefined);
    state.developerModeFromUrl.set(false);
  });

  it("covers controller and font-selection fallbacks", async () => {
    const fixture = installExplorerUiFixture();
    try {
      const originalDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
      );
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
      preferences.setString("mode", "mystery" as never);
      preferences.setString("theme", "base");

      const uiCalls: string[] = [];
      const controller = createExplorerUiController({
        deferredInstallPrompt: () => null,
        installAppButton: () => null,
        installDialog: () => null,
        installWebApp: async () => ({ deferredInstallPrompt: null }),
        offlineStatus: () => null,
        pixelEditor: () => null,
        renderDeveloperMode: () => uiCalls.push("renderDeveloperMode"),
        renderInstallAppButton: () => undefined,
        renderMusicToggle: () => uiCalls.push("renderMusicToggle"),
        renderPixelFontToggle: () => uiCalls.push("renderPixelFontToggle"),
        renderSearchLanguages: () => uiCalls.push("renderSearchLanguages"),
        renderSoundEffectsToggle: () => uiCalls.push("renderSoundEffectsToggle"),
        renderVersionModeToggle: () => uiCalls.push("renderVersionModeToggle"),
        setDeferredInstallPrompt: () => undefined,
      } as any);
      controller.applyTranslations();
      expect(uiCalls).toEqual([]);
      expect(() =>
        createExplorerUiController({
          deferredInstallPrompt: () => null,
          installAppButton: () => null,
          installDialog: () => null,
          installWebApp: async () => ({ deferredInstallPrompt: null }),
          offlineStatus: () => null,
          pixelEditor: () => null,
          renderDeveloperMode: () => undefined,
          renderInstallAppButton: () => undefined,
          renderMusicToggle: () => undefined,
          renderPixelFontToggle: () => undefined,
          renderSearchLanguages: () => undefined,
          renderSoundEffectsToggle: () => undefined,
          renderVersionModeToggle: () => undefined,
          setDeferredInstallPrompt: () => undefined,
        } as any).applyTranslations(),
      ).not.toThrow();

      const toggle = createElement();
      const noToggleController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any);
      expect(noToggleController.mode()).toBe("standard");
      noToggleController.render();

      const toggleController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => toggle,
      } as any);
      toggleController.render();
      expect(toggle.attributes.get("aria-pressed")).toBe("false");
      preferences.setString("mode", "advanced");
      delete fixture.documentElement.dataset.explorerMode;
      state.explorerModeFromUrl.set("developer");
      state.developerModeUrlDismissed.set(true);
      expect(toggleController.mode()).toBe("advanced");
      preferences.setString("mode", "");
      delete fixture.documentElement.dataset.explorerMode;
      state.explorerModeFromUrl.set(undefined);
      state.developerModeUrlDismissed.set(false);
      expect(toggleController.mode()).toBe("standard");

      const choiceWithoutQuery = createElement({ mode: "standard" });
      (choiceWithoutQuery as any).isConnected = true;
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          ...globalThis.document,
          documentElement: fixture.documentElement,
          querySelector: (globalThis.document as any).querySelector?.bind(globalThis.document),
          querySelectorAll(selector: string) {
            if (selector === ".mode-choice") return [choiceWithoutQuery];
            return [];
          },
        },
      });
      createDeveloperModeController({
        choices: () => [choiceWithoutQuery],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any).render();

      const undefinedChoicesController = createDeveloperModeController({
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
      } as any);
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          ...globalThis.document,
          documentElement: fixture.documentElement,
          querySelector: (globalThis.document as any).querySelector?.bind(globalThis.document),
          querySelectorAll() {
            return [];
          },
        },
      });
      undefinedChoicesController.render();
      await undefinedChoicesController.change({
        currentTarget: {
          checked: true,
          querySelector: () => null,
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("developer");

      const choiceA = createElement({ mode: "standard" });
      const choiceB = createElement({ mode: "advanced" });
      (choiceA as any).isConnected = true;
      (choiceB as any).isConnected = true;
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          ...globalThis.document,
          documentElement: fixture.documentElement,
          querySelector: (globalThis.document as any).querySelector?.bind(globalThis.document),
          querySelectorAll(selector: string) {
            if (selector === ".mode-choice") return [choiceA, choiceB];
            return [];
          },
        },
      });
      const queryModeController = createDeveloperModeController({
        choices: () => [choiceA, choiceB],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any);
      await queryModeController.change({
        currentTarget: {
          closest: () => null,
          querySelector: () => null,
        },
        target: { value: "advanced" },
      });
      expect(preferences.getString("mode")).toBe("advanced");

      await queryModeController.change({
        currentTarget: {
          closest: () => null,
          querySelector: () => null,
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("standard");

      const querySelectorFallbackController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any);
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          ...globalThis.document,
          documentElement: fixture.documentElement,
          querySelector: (globalThis.document as any).querySelector?.bind(globalThis.document),
          querySelectorAll() {
            return [];
          },
        },
      });
      await querySelectorFallbackController.change({
        currentTarget: {
          checked: true,
          querySelector: () => ({ value: "developer" }),
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("developer");

      const checkedFallbackController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any);
      await checkedFallbackController.change({
        currentTarget: { checked: true },
      });
      expect(preferences.getString("mode")).toBe("developer");
      await checkedFallbackController.change({
        currentTarget: { checked: false },
      });
      expect(preferences.getString("mode")).toBe("standard");

      const noRenderThemeController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => null,
      } as any);
      await noRenderThemeController.change({
        currentTarget: { checked: true },
      });
      expect(preferences.getString("mode")).toBe("developer");

      const noBlurEvent = {
        currentTarget: {
          blur: () => uiCalls.push("blur"),
          dataset: { emojiFont: "pixel" },
        },
        detail: 0,
      };
      selectEmojiFont(
        {
          renderPixelFontToggle: () => uiCalls.push("renderPixelFontToggleAgain"),
        },
        noBlurEvent,
      );
      expect(preferences.getBoolean("pixelFont")).toBe(true);
      expect(uiCalls.includes("blur")).toBe(false);

      selectEmojiFont(
        {
          renderPixelFontToggle: () =>
            uiCalls.push("renderPixelFontToggleNoDetail"),
        },
        {
          currentTarget: {
            blur: () => uiCalls.push("blur-no-detail"),
            dataset: { emojiFont: "system" },
          },
        },
      );
      expect(preferences.getBoolean("pixelFont")).toBe(false);
      expect(uiCalls.includes("blur-no-detail")).toBe(false);

      await queryModeController.change({
        currentTarget: {
          closest: () => ({ dataset: { mode: "mystery" } }),
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("standard");

      preferences.setString("theme", "dark");
      expect(fixture.documentElement.dataset.theme).toBe("dark");
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      }
    } finally {
      fixture.restore();
    }
  });
});
