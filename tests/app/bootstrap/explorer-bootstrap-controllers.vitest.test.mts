import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createBootstrapControllersFixture,
  installBootstrapControllerDom,
} from "./controllers/explorer-bootstrap-controllers-fixture.js";
import { createExplorerBootstrapControllersRuntimeFixture } from "./controllers/explorer-bootstrap-controllers-runtime-fixture.js";

const restoreDom = () => {
  const handle = installBootstrapControllerDom();
  return () => handle.restore();
};

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.doUnmock("../../../src/app/category-controller.js");
  vi.doUnmock("../../../src/app/version/version-runtime.js");
  vi.doUnmock("../../../src/app/list-orchestration.js");
  vi.doUnmock("../../../src/app/navigation-runtime.js");
  vi.doUnmock("../../../src/app/dialog/dialog-view-runtime.js");
  vi.doUnmock("../../../src/app/emoji/emoji-dialog-click-runtime.js");
  vi.doUnmock("../../../src/preferences.js");
});

describe("createExplorerBootstrapControllers", () => {
  it("exposes the composed controller API against the real runtime fixture", async () => {
    const undoDom = restoreDom();
    try {
      const { controllerApi, state } = createBootstrapControllersFixture();
      (state as any).allIds = [];

      for (const name of [
        "buildRepresentatives",
        "closeFilterPicker",
        "displayGroupName",
        "displayUnicodeSubGroupName",
        "drawList",
        "focusInitialAction",
        "focusCompactChoice",
        "getGroupRepresentativeEmoji",
        "getSubGroupRepresentativeEmoji",
        "getVersionKeys",
        "loadVersionData",
        "onCompactChoiceKeyDown",
        "onEmojiDialogClick",
        "onEmojiFocus",
        "onEmojiKeyDown",
        "onGroupSelectorChange",
        "onOrderModeChange",
        "onSequenceTypeSelectorChange",
        "onSubGroupSelectorChange",
        "openFilterPicker",
        "refreshLocalizedLabels",
        "renderCategoryFilters",
        "scheduleSearchDraw",
        "setView",
        "subGroupSelectionKey",
        "syncVersionRange",
        "updateActiveFilterSummary",
        "updateAvailableCategories",
        "versionSliderLabel",
      ] as const) {
        expect(typeof (controllerApi as any)[name]).toBe("function");
      }

      expect(() => controllerApi.buildRepresentatives("gift")).not.toThrow();
      expect(() => controllerApi.closeFilterPicker()).not.toThrow();
      expect(controllerApi.displayGroupName("Objects")).toBe("Objects");
      expect(controllerApi.displayUnicodeSubGroupName("mail")).toBe("Mail");
      expect(() => controllerApi.getGroupRepresentativeEmoji()).not.toThrow();
      expect(() =>
        controllerApi.getSubGroupRepresentativeEmoji(),
      ).not.toThrow();
      expect(() => controllerApi.getVersionKeys()).not.toThrow();
      expect(() =>
        controllerApi.onEmojiDialogClick({
          target: {
            closest() {
              return null;
            },
          },
        }),
      ).not.toThrow();
      expect(() =>
        controllerApi.onEmojiFocus({
          target: {
            closest() {
              return null;
            },
          },
        }),
      ).not.toThrow();
      expect(() =>
        controllerApi.onEmojiKeyDown({
          key: "Enter",
          preventDefault() {},
          target: {
            closest() {
              return null;
            },
          },
        }),
      ).not.toThrow();
      expect(() => controllerApi.openFilterPicker()).not.toThrow();
      expect(() => controllerApi.refreshLocalizedLabels()).not.toThrow();
      expect(() => controllerApi.loadVersionData()).not.toThrow();
      expect(controllerApi.subGroupSelectionKey("Objects", "mail")).toBe(
        "Objects::mail",
      );
      expect(() => controllerApi.syncVersionRange("17.0")).not.toThrow();
      expect(() => controllerApi.updateActiveFilterSummary()).not.toThrow();
      expect(() => controllerApi.versionSliderLabel("17.0")).not.toThrow();
    } finally {
      undoDom();
    }
  });

  it("reopens the parent panel when dialog click handling returns from a panel-backed dialog", async () => {
    const undoDom = restoreDom();
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    try {
      const { createControllers, options, state } =
        createBootstrapControllersFixture();

      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
          history: {
            state: {
              dialogParentPanel: "favorites",
              compositionParent: "wrappedGift",
            },
          },
          location: { href: "https://example.test/" },
        },
      });

      let dialogClosed = false;
      let suppressSync = false;
      let openedPanel: any;
      let syncedState: any;
      state.currentDialogParentStack = ["favorites"];
      const dialogElement = {
        dataset: { dialogParentPanel: "favorites" },
        close() {
          dialogClosed = true;
        },
        showModal() {},
        querySelector() {
          return null;
        },
      };

      const clickControllers = createControllers({
        dialog: () => dialogElement,
        languageList: () => "language-list",
        openPanel: (value: unknown) => {
          openedPanel = value;
        },
        panelDialogs: () => ({ favorites: "favorites-dialog" }),
        setSuppressDialogCloseSync: (value: boolean) => {
          suppressSync = value;
        },
        syncUrlState: (...args: unknown[]) => {
          syncedState = args;
        },
      });

      clickControllers.onEmojiDialogClick({
        target: {
          closest(selector: string) {
            return selector === ".emoji-parent" ? {} : null;
          },
        },
      } as unknown as MouseEvent);

      expect(dialogClosed).toBe(true);
      expect(suppressSync).toBe(false);
      expect(state.currentDialogParentStack).toEqual([]);
      expect(openedPanel.panel).toBe("favorites");
      expect(openedPanel.addHistory).toBe(false);
      expect(openedPanel.dialogs).toEqual({ favorites: "favorites-dialog" });
      expect(openedPanel.languageList).toBe("language-list");
      expect(openedPanel.renderSavedEmoji).toBe(options.renderSavedEmoji);
      expect(typeof openedPanel.syncUrlState).toBe("function");
      expect(syncedState).toEqual(["replace", {}]);
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
      undoDom();
    }
  });

  it("wires factory-created runtimes through shared state and option delegates", async () => {
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem() {
            return JSON.stringify({ order: "grouped" });
          },
          setItem() {},
        },
      },
    });

    try {
      const { createExplorerBootstrapControllersWithFactories } =
        await import("../../../src/app/bootstrap/explorer-bootstrap-controllers.js");
      const preferences = await import("../../../src/preferences.js");
      const sharedState = await import("../../../src/state.js");
      preferences.init({});
      sharedState.compositionMode.set("full" as any);
      sharedState.orderMode.set("grouped");
      sharedState.selectedGroup.set("Objects");
      sharedState.selectedSequenceType.set("single");
      sharedState.selectedSubGroup.set("money");
      sharedState.currentDialogParentStack.set(["favorites"]);
      sharedState.currentEmojiCopies.replace({ emoji: "🎁" } as any);
      sharedState.displayedKeys.set(["wrappedGift", "sparkles"]);
      sharedState.versionManifests.set([{ version: "17.0" }] as any);

      const { calls, options, state } =
        createExplorerBootstrapControllersRuntimeFixture();

      let categoryOptions: any;
      let listOptions: any;
      let versionOptions: any;
      let navigationOptions: any;
      let dialogViewOptions: any;
      let dialogClickOptions: any;

      const controllers = createExplorerBootstrapControllersWithFactories(
        options,
        {
          createCategoryController(config: any) {
            categoryOptions = config;
            return {
              buildRepresentatives: (...args: any[]) => [
                "buildRepresentatives",
                ...args,
              ],
              displayGroupName: (value: string) => `group:${value}`,
              displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
              onGroupSelectorChange: (...args: any[]) => [
                "groupChange",
                ...args,
              ],
              onSequenceTypeSelectorChange: (...args: any[]) => [
                "sequenceChange",
                ...args,
              ],
              onSubGroupSelectorChange: (...args: any[]) => [
                "subGroupChange",
                ...args,
              ],
              renderCategoryFilters: (...args: any[]) => [
                "renderCategoryFilters",
                ...args,
              ],
              subGroupSelectionKey: (...args: any[]) => args.join(":"),
            };
          },
          createListOrchestration(config: any) {
            listOptions = config;
            return {
              drawList: (...args: any[]) => ["drawList", ...args],
            };
          },
          createVersionRuntime(config: any) {
            versionOptions = config;
            return {
              getVersionKeys: () => "version-keys",
              loadVersionData: () => "loadVersionData",
              syncVersionRange: (...args: any[]) => [
                "syncVersionRange",
                ...args,
              ],
              updateAvailableCategories: () => "updateAvailableCategories",
              versionSliderLabel: (...args: any[]) => args.join(":"),
            };
          },
          createNavigationRuntime(config: any) {
            navigationOptions = config;
            return {
              applyLoadedUrlState: (...args: any[]) => [
                "applyLoadedUrlState",
                ...args,
              ],
              focusInitialAction: () => "focusInitialAction",
              onOrderModeChange: () => "onOrderModeChange",
            };
          },
          createDialogViewRuntime(config: any) {
            dialogViewOptions = config;
            return {
              setView: (...args: any[]) => ["setView", ...args],
            };
          },
          createEmojiDialogClickRuntime(config: any) {
            dialogClickOptions = config;
            return () => config;
          },
        },
      );

      expect(categoryOptions.getVersionKeys()).toBe("version-keys");
      expect(categoryOptions.syncVersionRange()).toEqual(["syncVersionRange"]);
      expect(categoryOptions.developerModeEnabled()).toBe(true);
      expect(categoryOptions.orderButtons()).toEqual(["order-buttons"]);
      expect(categoryOptions.translate("a", "b")).toBe("a:b");

      expect(listOptions.getVersionKeys()).toBe("version-keys");
      expect(listOptions.renderGeneration()).toBe(7);
      expect(listOptions.versionSliderLabel("16.0", "17.0")).toBe("16.0:17.0");
      expect(listOptions.displayGroupName("Objects")).toBe("group:Objects");
      expect(listOptions.displayUnicodeSubGroupName("money")).toBe("sub:money");
      expect(listOptions.formatNumber(5)).toBe("fmt:5");
      expect(listOptions.subGroupSelectionKey("Objects", "money")).toBe(
        "Objects:money",
      );
      expect(listOptions.syncUrlState("replace")).toEqual([
        "syncUrlState",
        "replace",
      ]);

      expect(versionOptions.applyLoadedUrlState("replace")).toEqual([
        "applyLoadedUrlState",
        "replace",
      ]);
      expect(versionOptions.drawList("wrappedGift")).toEqual([
        "drawList",
        "wrappedGift",
      ]);
      expect(versionOptions.onGroupChange("gift")).toEqual([
        "groupChange",
        "gift",
      ]);
      expect(versionOptions.onSequenceTypeChange("single")).toEqual([
        "sequenceChange",
        "single",
      ]);
      expect(versionOptions.onSubGroupChange("money")).toEqual([
        "subGroupChange",
        "money",
      ]);
      expect(versionOptions.renderCategoryFilters("Objects")).toEqual([
        "renderCategoryFilters",
        "Objects",
      ]);
      expect(versionOptions.setDialogView("code")).toEqual([
        "setDialogView",
        "code",
      ]);

      expect(navigationOptions.compositionMode()).toBe("full");
      expect(navigationOptions.getOrderMode()).toBe("grouped");
      expect(navigationOptions.getSelectedGroup()).toBe("Objects");
      expect(navigationOptions.getSelectedSequenceType()).toBe("single");
      expect(navigationOptions.getSelectedSubGroup()).toBe("money");
      expect(navigationOptions.displayedKeys()).toEqual([
        "wrappedGift",
        "sparkles",
      ]);
      expect(navigationOptions.latestReleasedVersion()).toBe("17.0");
      expect(navigationOptions.preferredOrder()).toBe("grouped");
      expect(navigationOptions.syncVersionRange("16.0", "17.0")).toEqual([
        "syncVersionRange",
        "16.0",
        "17.0",
      ]);
      navigationOptions.setCompositionMode("condensed");
      navigationOptions.setSelectedGroup("Smileys");
      navigationOptions.setSelectedSequenceType("zwj");
      navigationOptions.setSelectedSubGroup("face-smiling");
      expect(sharedState.compositionMode.get()).toBe("condensed");
      expect(sharedState.selectedGroup.get()).toBe("Smileys");
      expect(sharedState.selectedSequenceType.get()).toBe("zwj");
      expect(sharedState.selectedSubGroup.get()).toBe("face-smiling");
      navigationOptions.setSuppressDialogCloseSync(true);
      expect(calls).toContain("setSuppressDialogCloseSync:true");

      expect(dialogViewOptions.developerModeEnabled()).toBe(true);
      expect(dialogViewOptions.dialog()).toEqual({ open: true });
      expect(dialogViewOptions.emojiParent()).toBe("emoji-parent");
      expect(dialogViewOptions.getPixelEditor()).toBe("pixel-editor");
      expect(dialogViewOptions.syncUrlState("push")).toEqual([
        "syncUrlState",
        "push",
      ]);

      expect(dialogClickOptions.currentDialogParentStack()).toEqual([
        "favorites",
      ]);
      expect(dialogClickOptions.currentEmojiCopies()).toEqual({ emoji: "🎁" });
      expect(dialogClickOptions.languageList()).toBe("language-list");
      expect(dialogClickOptions.panelDialogs()).toEqual({ help: "help-panel" });
      expect(dialogClickOptions.setView("code")).toEqual(["setView", "code"]);
      expect(dialogClickOptions.showEmoji("sparkles")).toEqual([
        "showEmoji",
        "sparkles",
      ]);
      dialogClickOptions.toggleComposition();
      dialogClickOptions.toggleComposition();
      expect(dialogClickOptions.translate("copy", "Copy")).toBe("copy:Copy");
      dialogClickOptions.clearCurrentDialogParentStack();

      expect(sharedState.compositionMode.get()).toBe("condensed");
      expect(sharedState.currentDialogParentStack.get()).toEqual([]);
      expect(typeof controllers.onEmojiDialogClick).toBe("function");
      expect(controllers.loadVersionData()).toBe("loadVersionData");
      expect(controllers.updateAvailableCategories()).toBe(
        "updateAvailableCategories",
      );
      expect(controllers.onOrderModeChange()).toBe("onOrderModeChange");
      expect(controllers.focusInitialAction()).toBe("focusInitialAction");
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });

  it("uses the imported runtime factories when no overrides are provided", async () => {
    const categoryFactory = vi.fn(() => ({ category: true }));
    const versionFactory = vi.fn(() => ({ version: true }));
    const listFactory = vi.fn(() => ({ list: true }));
    const navigationFactory = vi.fn(() => ({ navigation: true }));
    const dialogViewFactory = vi.fn(() => ({ dialogView: true }));
    const dialogClickFactory = vi.fn(() => vi.fn(() => "dialog-click"));
    const getString = vi.fn(() => "grouped");

    vi.doMock("../../../src/app/category-controller.js", () => ({
      createCategoryController: categoryFactory,
    }));
    vi.doMock("../../../src/app/version/version-runtime.js", () => ({
      createVersionRuntime: versionFactory,
    }));
    vi.doMock("../../../src/app/list-orchestration.js", () => ({
      createListOrchestration: listFactory,
    }));
    vi.doMock("../../../src/app/navigation-runtime.js", () => ({
      createNavigationRuntime: navigationFactory,
    }));
    vi.doMock("../../../src/app/dialog/dialog-view-runtime.js", () => ({
      createDialogViewRuntime: dialogViewFactory,
    }));
    vi.doMock("../../../src/app/emoji/emoji-dialog-click-runtime.js", () => ({
      createEmojiDialogClickRuntime: dialogClickFactory,
    }));
    vi.doMock("../../../src/preferences.js", () => ({
      getString,
    }));

    const module =
      await import("../../../src/app/bootstrap/explorer-bootstrap-controllers.js");
    const { options } = createExplorerBootstrapControllersRuntimeFixture();

    const controllers = module.createExplorerBootstrapControllers(options);

    expect(categoryFactory).toHaveBeenCalledTimes(1);
    expect(versionFactory).toHaveBeenCalledTimes(1);
    expect(listFactory).toHaveBeenCalledTimes(1);
    expect(navigationFactory).toHaveBeenCalledTimes(1);
    expect(dialogViewFactory).toHaveBeenCalledTimes(1);
    expect(dialogClickFactory).toHaveBeenCalledTimes(1);
    expect(getString).not.toHaveBeenCalled();
    expect(controllers).toEqual(
      expect.objectContaining({
        category: true,
        version: true,
        list: true,
        navigation: true,
        dialogView: true,
        onEmojiDialogClick: expect.any(Function),
      }),
    );
  });
});
