import { beforeEach, describe, expect, it, vi } from "vitest";

const createEmojiSessionController = vi.fn((options: any) => ({
  showEmoji: vi.fn(() => ({ kind: "showEmoji", options })),
}));
const createDialogNavigationController = vi.fn((options: any) => ({
  navigate: vi.fn(() => ({ kind: "navigate", options })),
  update: vi.fn(() => ({ kind: "update", options })),
  updateBack: vi.fn(() => ({ kind: "updateBack", options })),
}));
const createEmojiDialogViewController = vi.fn((options: any) => ({
  kind: "view-controller",
  options,
}));
const withoutCompositionParent = vi.fn((state: any) => ({
  kept: state?.kept ?? true,
}));
const resolveDialogNavigationState = vi.fn(() => ({ kind: "resolved" }));

vi.mock("../../../src/app/emoji/emoji-session-controller.js", () => ({
  createEmojiSessionController,
}));
vi.mock("../../../src/explorer/dialog/dialog-navigation-controller.js", () => ({
  createDialogNavigationController,
}));
vi.mock("../../../src/explorer/dialog/dialog-runtime-helpers.js", () => ({
  withoutCompositionParent,
}));
vi.mock("../../../src/explorer/dialog/dialog-state.js", () => ({
  resolveDialogNavigationState,
}));
vi.mock("../../../src/explorer/dialog/dialog-view.js", () => ({
  createEmojiDialogViewController,
}));

describe("dialog runtime", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.currentDialogParentStack.set(["favorites"]);
    state.currentEmojiKey.set("wrappedGift");
    state.dialogNavigationKeys.set(["wrappedGift", "wave"]);
    state.displayedKeys.set(["wrappedGift", "wave", "partyPopper"]);
  });

  it("wires emoji session and navigation controllers through shared state", async () => {
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { history: { state: { kept: "value", compositionParent: "x" } } },
    });

    try {
      const { initializeDialogRuntime } =
        await import("../../../src/app/dialog/dialog-runtime.js");

      const copyStatus = { textContent: "copied" };
      const dialog = {
        dataset: {} as Record<string, string>,
        showModal: vi.fn(),
      };
      const syncUrlState = vi.fn();
      const setCurrentDialogParentStack = vi.fn();
      const setDialogView = vi.fn();
      const focusInitialAction = vi.fn();
      const updateCompositionBackButton = vi.fn();
      const updateDialogNavigation = vi.fn();

      const runtime = initializeDialogRuntime({
        applyPixelArtworkClass: "applyPixelArtworkClass",
        applyStandalonePixelArtwork: "applyStandalonePixelArtwork",
        copyStatus: () => copyStatus,
        developerModeEnabled: () => true,
        fullDeveloperModeEnabled: () => false,
        dialog: () => dialog,
        displayGroupName: (value: string) => `group:${value}`,
        displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
        emojiNext: () => "next-button",
        emojiParent: () => "parent-button",
        emojiPrevious: () => "previous-button",
        focusInitialAction,
        getIntroducedVersion: (value: string) => `v:${value}`,
        openEditor: vi.fn(),
        sequenceTranslationKeys: { single: "single" },
        sequenceTypeLabels: { single: "Single" },
        setCurrentDialogParentStack,
        setDialogView,
        statusTranslationKeys: { "fully-qualified": "fullyQualified" },
        syncUrlState,
        translate: (key: string, fallback: string) => `${key}:${fallback}`,
        updateCompositionBackButton,
        updateDialogNavigation,
        updateEmojiComposition: "updateEmojiComposition",
        updateFavoriteButton: "updateFavoriteButton",
        updateRenderingDiagnostic: "updateRenderingDiagnostic",
      });

      expect(createEmojiSessionController).toHaveBeenCalledTimes(1);
      const sessionOptions: any =
        createEmojiSessionController.mock.calls[0]![0];
      expect(sessionOptions.applyPixelArtworkClass).toBe(
        "applyPixelArtworkClass",
      );
      expect(sessionOptions.applyStandalonePixelArtwork).toBe(
        "applyStandalonePixelArtwork",
      );
      expect(sessionOptions.developerModeEnabled()).toBe(true);
      expect(sessionOptions.fullDeveloperModeEnabled()).toBe(false);
      expect(sessionOptions.displayGroupName("Smileys")).toBe("group:Smileys");
      expect(sessionOptions.getIntroducedVersion("wave")).toBe("v:wave");
      expect(sessionOptions.translate("group", "Group")).toBe("group:Group");

      sessionOptions.openDialogAction("code", "favorites");
      expect(copyStatus.textContent).toBe("");
      expect(dialog.dataset.dialogParentPanel).toBe("favorites");
      expect(setCurrentDialogParentStack).toHaveBeenCalledWith(["favorites"]);
      expect(setDialogView).toHaveBeenCalledWith("code", false);
      expect(dialog.showModal).toHaveBeenCalledTimes(1);
      expect(focusInitialAction).toHaveBeenCalledTimes(1);
      expect(syncUrlState).toHaveBeenCalledWith("push", {
        kept: "value",
        emojiDialogEntry: true,
        dialogParentPanel: "favorites",
      });
      expect(updateCompositionBackButton).toHaveBeenCalledTimes(1);
      expect(withoutCompositionParent).toHaveBeenCalledWith({
        kept: "value",
        compositionParent: "x",
      });

      expect(createDialogNavigationController).toHaveBeenCalledTimes(1);
      const navigationOptions: any =
        createDialogNavigationController.mock.calls[0]![0];
      expect(navigationOptions.currentDialogParentStack()).toEqual([
        "favorites",
      ]);
      expect(navigationOptions.currentEmojiKey()).toBe("wrappedGift");
      expect(navigationOptions.dialogNavigationKeys()).toEqual([
        "wrappedGift",
        "wave",
      ]);
      expect(navigationOptions.displayedKeys()).toEqual([
        "wrappedGift",
        "wave",
        "partyPopper",
      ]);
      expect(navigationOptions.emojiNext()).toBe("next-button");
      expect(navigationOptions.emojiParent()).toBe("parent-button");
      expect(navigationOptions.emojiPrevious()).toBe("previous-button");
      expect(navigationOptions.resolveNavigation).toBe(
        resolveDialogNavigationState,
      );
      expect(navigationOptions.showEmoji).toBe(runtime.showEmoji);
      expect(navigationOptions.syncUrlState).toBe(syncUrlState);
      expect(navigationOptions.translate("copy", "Copy")).toBe("copy:Copy");

      expect(runtime.showEmoji("wrappedGift")).toEqual({
        kind: "showEmoji",
        options: sessionOptions,
      });
      expect(runtime.navigateEmoji(1)).toEqual({
        kind: "navigate",
        options: navigationOptions,
      });
      expect(runtime.updateDialogNavigation()).toEqual({
        kind: "update",
        options: navigationOptions,
      });
      expect(runtime.updateCompositionBackButton()).toEqual({
        kind: "updateBack",
        options: navigationOptions,
      });
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });

  it("wraps dialog view controller dependencies with shared state selectors", async () => {
    const { createDialogViewRuntime } =
      await import("../../../src/app/dialog/dialog-view-runtime.js");

    const runtime = createDialogViewRuntime({
      developerModeEnabled: () => true,
      fullDeveloperModeEnabled: () => false,
      dialog: () => "dialog",
      emojiParent: () => "emoji-parent",
      ensurePixelEditor: () => "ensure-pixel-editor",
      getPixelEditor: () => "pixel-editor",
      loadPackageManifest: "loadPackageManifest",
      syncUrlState: "syncUrlState",
      translate: "translate",
      updateCompositionBackButton: "updateCompositionBackButton",
      updateImportExamples: "updateImportExamples",
    });

    expect(runtime).toEqual({
      kind: "view-controller",
      options: createEmojiDialogViewController.mock.calls[0]![0],
    });

    const forwarded: any = createEmojiDialogViewController.mock.calls[0]![0];
    expect(forwarded.currentDialogParentStack()).toEqual(["favorites"]);
    expect(forwarded.currentEmojiKey()).toBe("wrappedGift");
    expect(forwarded.developerModeEnabled()).toBe(true);
    expect(forwarded.fullDeveloperModeEnabled()).toBe(false);
    expect(forwarded.dialog()).toBe("dialog");
    expect(forwarded.emojiParent()).toBe("emoji-parent");
    expect(forwarded.ensurePixelEditor()).toBe("ensure-pixel-editor");
    expect(forwarded.getPixelEditor()).toBe("pixel-editor");
    expect(forwarded.loadPackageManifest).toBe("loadPackageManifest");
    expect(forwarded.syncUrlState).toBe("syncUrlState");
    expect(forwarded.translate).toBe("translate");
    expect(forwarded.updateCompositionBackButton).toBe(
      "updateCompositionBackButton",
    );
    expect(forwarded.updateImportExamples).toBe("updateImportExamples");
  });
});
