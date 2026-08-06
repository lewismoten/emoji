import { afterEach, describe, expect, it } from "vitest";

import * as preferences from "../../../src/preferences.js";
import { createDeveloperModeController } from "../../../src/explorer-ui.js";
import * as state from "../../../src/state.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

describe("explorer-ui developer mode", () => {
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

  it("renders and changes developer-mode choices across modern and fallback paths", async () => {
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
      preferences.setString("mode", "developer");
      preferences.setString("theme", "base");
      state.developerModeFromUrl.set(true);
      state.explorerModeFromUrl.set("developer");
      state.developerModeUrlDismissed.set(false);

      const calls: string[] = [];
      const developerToggle = createElement();
      const standardModeInput = createElement();
      const advancedModeInput = createElement();
      const developerModeInput = createElement();
      const standardModeChoice = createElement({ mode: "standard" });
      const advancedModeChoice = createElement({ mode: "advanced" });
      const developerModeChoice = createElement({ mode: "developer" });
      (standardModeChoice as any).isConnected = true;
      (advancedModeChoice as any).isConnected = true;
      (developerModeChoice as any).isConnected = true;
      standardModeChoice.querySelector = () => standardModeInput;
      advancedModeChoice.querySelector = () => advancedModeInput;
      developerModeChoice.querySelector = () => developerModeInput;
      const developerDialog = {
        open: true,
        classList: {
          contains(name: string) {
            return name === "is-editor-view";
          },
        },
      };
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          ...globalThis.document,
          documentElement: fixture.documentElement,
          querySelector: (globalThis.document as any).querySelector?.bind(globalThis.document),
          querySelectorAll(selector: string) {
            if (selector === ".mode-choice") {
              return [
                standardModeChoice,
                advancedModeChoice,
                developerModeChoice,
              ];
            }
            return [];
          },
        },
      });

      const developerController = createDeveloperModeController({
        choices: () => [
          standardModeChoice,
          advancedModeChoice,
          developerModeChoice,
        ],
        dialog: () => developerDialog,
        disableDeveloperFeatures: () => calls.push("disable-developer"),
        loadVersionData: async () => {
          calls.push("load-version-data");
        },
        setDialogView: (view: string) => calls.push(`dialog:${view}`),
        syncUrlState: () => calls.push("sync-url"),
        toggle: () => developerToggle,
      } as any);

      developerController.render();
      expect(developerModeChoice.classList.active.has("is-active")).toBe(true);
      expect(developerModeChoice.attributes.get("aria-checked")).toBe("true");
      expect(developerModeChoice.tabIndex).toBe(0);
      expect(developerModeInput.checked).toBe(true);
      expect(standardModeChoice.tabIndex).toBe(-1);

      await developerController.change({
        currentTarget: {
          closest: () => ({ dataset: { mode: "standard" } }),
        },
      });
      expect(state.developerModeFromUrl.get()).toBe(false);
      expect(state.explorerModeFromUrl.get()).toBe("standard");
      expect(state.developerModeUrlDismissed.get()).toBe(true);
      expect(preferences.getString("theme")).toBe("dark");
      expect(calls.includes("dialog:details")).toBe(true);
      expect(calls.includes("disable-developer")).toBe(true);
      expect(calls.includes("sync-url")).toBe(true);

      const toggleOnlyController = createDeveloperModeController({
        dialog: () => developerDialog,
        disableDeveloperFeatures: () => undefined,
        loadVersionData: async () => undefined,
        setDialogView: () => undefined,
        syncUrlState: () => undefined,
        toggle: () => developerToggle,
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
      preferences.setString("mode", "standard");
      delete fixture.documentElement.dataset.explorerMode;
      state.explorerModeFromUrl.set("standard");
      state.developerModeUrlDismissed.set(true);
      toggleOnlyController.render();
      expect(developerToggle.checked).toBe(false);
      expect(developerToggle.attributes.get("aria-pressed")).toBe("false");

      state.explorerModeFromUrl.set(undefined);
      state.developerModeUrlDismissed.set(false);
      preferences.setString("mode", "developer");
      preferences.setString("theme", "dark");
      delete fixture.documentElement.dataset.explorerMode;
      state.explorerModeFromUrl.set("developer");
      const legacyController = createDeveloperModeController({
        choices: () => [],
        dialog: () => ({ open: false, classList: { contains: () => false } }),
        disableDeveloperFeatures: () => calls.push("disable-legacy"),
        loadVersionData: async () => {
          calls.push("load-version-data-legacy");
        },
        setDialogView: (view: string) => calls.push(`legacy-dialog:${view}`),
        syncUrlState: () => calls.push("legacy-sync-url"),
        toggle: () => developerToggle,
      } as any);
      legacyController.render();
      expect(legacyController.enabled()).toBe(true);
      expect(legacyController.fullEnabled()).toBe(true);
      expect(legacyController.mode()).toBe("developer");

      await legacyController.change({
        currentTarget: {
          checked: true,
          querySelector: () => null,
        },
        target: { value: "advanced" },
      });
      expect(preferences.getString("mode")).toBe("advanced");
      expect(calls.includes("load-version-data-legacy")).toBe(true);

      await legacyController.change({
        currentTarget: {
          checked: false,
          querySelector: () => null,
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("standard");
      expect(calls.includes("disable-legacy")).toBe(true);

      state.explorerModeFromUrl.set(undefined);
      state.developerModeUrlDismissed.set(false);
      preferences.setString("mode", "advanced");
      preferences.setString("theme", "dark");
      const noChoicesDialog = {
        open: false,
        classList: { contains: () => false },
      };
      const noChoicesController = createDeveloperModeController({
        choices: () => [],
        dialog: () => noChoicesDialog,
        disableDeveloperFeatures: () => calls.push("disable-no-choices"),
        loadVersionData: async () => {
          calls.push("load-version-data-no-choices");
        },
        setDialogView: (view: string) => calls.push(`no-choices-dialog:${view}`),
        syncUrlState: () => calls.push("sync-url-no-choices"),
        toggle: () => developerToggle,
      } as any);
      await noChoicesController.change({
        currentTarget: {
          checked: true,
          querySelector: () => ({ value: "developer" }),
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("developer");

      await noChoicesController.change({
        currentTarget: {
          checked: false,
          querySelector: () => ({ value: "mystery" }),
        },
        target: {},
      });
      expect(preferences.getString("mode")).toBe("standard");
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      }
    } finally {
      fixture.restore();
    }
  });
});
