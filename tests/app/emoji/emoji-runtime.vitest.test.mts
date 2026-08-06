import { beforeEach, describe, expect, it, vi } from "vitest";

const showEmojiSession = vi.fn();
const createEmojiDialogClickHandler = vi.fn((options: any) => {
  const handler = vi.fn((event: any) => ({ options, event }));
  return handler;
});
const getHref = vi.fn(() => "https://example.test/emoji?x=1");
const getCodeExampleTextValue = vi.fn(
  () => 'import emoji from "@lewismoten/emoji/all";\nconst value = "🎁";',
);

vi.mock("../../../src/explorer/dialog/emoji-session.js", () => ({
  showEmojiSession,
}));
vi.mock("../../../src/explorer/dialog/emoji-dialog-events.js", () => ({
  createEmojiDialogClickHandler,
}));
vi.mock("../../../src/app/route.js", () => ({
  getHref,
}));
vi.mock("../../../src/explorer/emoji/import-examples.js", () => ({
  getCodeExampleText: getCodeExampleTextValue,
}));

describe("emoji runtime wrappers", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const state = await import("../../../src/state.js");
    state.byId.replace({ wrappedGift: { key: "wrappedGift" } } as any);
    state.compositionMode.set("condensed" as any);
    state.currentEmojiCopies.replace({ key: "before" } as any);
    state.currentEmojiKey.set("before");
    state.currentDialogParentStack.set(["favorites"]);
    state.dialogNavigationKeys.set(["wrappedGift"]);
    state.displayedKeys.set(["wrappedGift"]);
    state.emojiByKey.replace({ wrappedGift: "🎁" } as any);
    state.items.set([{ key: "wrappedGift" }] as any);
    state.searchAnnotations.replace({ wrappedGift: ["gift"] } as any);
    state.selectedSearchLocale.set("en");
  });

  it("forwards emoji session options through shared state and writes back mutations", async () => {
    showEmojiSession.mockImplementation((options: any) => {
      options.currentEmojiCopies.value = { key: "after" };
      options.currentEmojiKey.value = "wrappedGift";
      options.currentDialogParentStack.value = ["help"];
      options.dialogNavigationKeys.value = ["sparkles"];
    });

    const { createEmojiSessionController } =
      await import("../../../src/app/emoji/emoji-session-controller.js");
    const state = await import("../../../src/state.js");

    const controller = createEmojiSessionController({
      applyPixelArtworkClass: "apply-pixel",
      applyStandalonePixelArtwork: "apply-standalone",
      developerModeEnabled: () => true,
      fullDeveloperModeEnabled: () => false,
      dialog: () => ({ open: false }),
      displayGroupName: (value: string) => `group:${value}`,
      displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
      getIntroducedVersion: () => "17.0",
      openDialogAction: "open-dialog",
      openEditor: "open-editor",
      sequenceTranslationKeys: { single: "single" },
      sequenceTypeLabels: { single: "Single" },
      statusTranslationKeys: { "fully-qualified": "fullyQualified" },
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
      updateDialogNavigation: "update-navigation",
      updateEmojiComposition: "update-composition",
      updateFavoriteButton: "update-favorite",
      updateRenderingDiagnostic: "update-rendering",
    });

    controller.showEmoji(
      "wrappedGift",
      false,
      ["wrappedGift", "sparkles"],
      "editor",
      "help",
    );

    expect(showEmojiSession).toHaveBeenCalledTimes(1);
    const options: any = showEmojiSession.mock.calls[0]![0];
    expect(options.applyPixelArtworkClass).toBe("apply-pixel");
    expect(options.applyStandalonePixelArtwork).toBe("apply-standalone");
    expect(options.byId).toEqual({ wrappedGift: { key: "wrappedGift" } });
    expect(options.compositionMode).toBe("condensed");
    expect(options.currentEmojiCopies.value).toEqual({ key: "after" });
    expect(options.currentEmojiKey.value).toBe("wrappedGift");
    expect(options.currentDialogParentStack.value).toEqual(["help"]);
    expect(options.developerMode).toBe(true);
    expect(options.fullDeveloperMode).toBe(false);
    expect(options.dialog).toEqual({ open: false });
    expect(options.dialogNavigationKeys.value).toEqual(["sparkles"]);
    expect(options.displayGroupName("Objects")).toBe("group:Objects");
    expect(options.displayUnicodeSubGroupName("money")).toBe("sub:money");
    expect(options.displayedKeys).toEqual({ value: ["wrappedGift"] });
    expect(options.emojiByKey).toEqual({ wrappedGift: "🎁" });
    expect(options.getIntroducedVersion()).toBe("17.0");
    expect(options.id).toBe("wrappedGift");
    expect(options.initialMode).toBe("editor");
    expect(options.items).toEqual([{ key: "wrappedGift" }]);
    expect(options.navigationKeys).toEqual(["wrappedGift", "sparkles"]);
    expect(options.openDialog).toBe(false);
    expect(options.parentPanel).toBe("help");
    expect(options.openDialogAction).toBe("open-dialog");
    expect(options.openEditor).toBe("open-editor");
    expect(options.searchAnnotations).toEqual({ wrappedGift: ["gift"] });
    expect(options.selectedSearchLocale).toBe("en");
    expect(options.sequenceTranslationKeys).toEqual({ single: "single" });
    expect(options.sequenceTypeLabels).toEqual({ single: "Single" });
    expect(options.statusTranslationKeys).toEqual({
      "fully-qualified": "fullyQualified",
    });
    expect(options.translate("x", "y")).toBe("x:y");
    expect(options.updateDialogNavigation).toBe("update-navigation");
    expect(options.updateEmojiComposition).toBe("update-composition");
    expect(options.updateFavoriteButton).toBe("update-favorite");
    expect(options.updateRenderingDiagnostic).toBe("update-rendering");

    expect(state.currentEmojiCopies.get()).toEqual({ key: "after" });
    expect(state.currentEmojiKey.get()).toBe("wrappedGift");
    expect(state.currentDialogParentStack.get()).toEqual(["help"]);
    expect(state.dialogNavigationKeys.get()).toEqual(["sparkles"]);
  });

  it("wraps dialog click helpers with route and shared state readers", async () => {
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        history: { state: { keep: true, dialogParentPanel: "favorites" } },
      },
    });

    try {
      const { createEmojiDialogClickRuntime } =
        await import("../../../src/app/emoji/emoji-dialog-click-runtime.js");
      const state = await import("../../../src/state.js");
      state.currentEmojiKey.set("wrappedGift");
      state.byId.replace({ wrappedGift: { key: "wrappedGift" } } as any);
      state.emojiByKey.replace({ wrappedGift: "🎁" } as any);

      const syncUrlState = vi.fn();
      const showEmoji = vi.fn();
      const updateCompositionBackButton = vi.fn();
      const updateEmojiComposition = vi.fn();
      const setView = vi.fn();
      const openPanel = vi.fn();
      const toggleComposition = vi.fn();
      const toggleFavorite = vi.fn();
      const recordCopiedEmoji = vi.fn();
      const setSuppressDialogCloseSync = vi.fn();
      const clearCurrentDialogParentStack = vi.fn();
      const dialog = {
        close: vi.fn(),
        dataset: { dialogParentPanel: "favorites" },
      };

      const handler = createEmojiDialogClickRuntime({
        animateCopy: "animateCopy",
        copy: "copy",
        currentEmojiCopies: () => ({ emoji: "🎁", code: "ignored" }),
        dialog: () => dialog,
        languageList: () => ({ id: "language-list" }),
        openPanel,
        panelDialogs: () => ({ help: {}, favorites: {} }),
        recordCopiedEmoji,
        renderSavedEmoji: "rendered",
        setSuppressDialogCloseSync,
        setView,
        showEmoji,
        syncUrlState,
        toggleComposition,
        toggleFavorite,
        translate: (key: string, fallback: string) => `${key}:${fallback}`,
        updateCompositionBackButton,
        updateEmojiComposition,
        clearCurrentDialogParentStack,
      });

      expect(handler).toBeTypeOf("function");
      expect(createEmojiDialogClickHandler).toHaveBeenCalledTimes(1);
      const options: any = createEmojiDialogClickHandler.mock.calls[0]![0];
      expect(options.animateCopy).toBe("animateCopy");
      expect(options.copy).toBe("copy");
      expect(options.copyValue("emoji")).toBe("🎁");
      expect(options.copyValue("code")).toBe(
        'import emoji from "@lewismoten/emoji/all";\nconst value = "🎁";',
      );
      expect(options.copyValue("link")).toBe("https://example.test/emoji?x=1");
      expect(options.currentEmojiKey()).toBe("wrappedGift");
      expect(options.dialog()).toBe(dialog);
      expect(options.recordCopiedEmoji).toBe(recordCopiedEmoji);
      expect(options.setView).toBe(setView);
      expect(options.translate("copy", "Copy")).toBe("copy:Copy");

      options.openParentPanel("favorites");
      expect(setSuppressDialogCloseSync).toHaveBeenNthCalledWith(1, true);
      expect(dialog.dataset.dialogParentPanel).toBe("");
      expect(clearCurrentDialogParentStack).toHaveBeenCalledTimes(1);
      expect(dialog.close).toHaveBeenCalledTimes(1);
      expect(setSuppressDialogCloseSync).toHaveBeenNthCalledWith(2, false);
      expect(openPanel).toHaveBeenCalledWith({
        panel: "favorites",
        addHistory: false,
        dialogs: { help: {}, favorites: {} },
        languageList: { id: "language-list" },
        renderSavedEmoji: "rendered",
        syncUrlState,
      });
      expect(syncUrlState).toHaveBeenCalledWith("replace", { keep: true });

      options.openComposition("partyPopper");
      expect(showEmoji).toHaveBeenCalledWith("partyPopper", false);
      expect(syncUrlState).toHaveBeenCalledWith("push", {
        keep: true,
        dialogParentPanel: "favorites",
        emojiDialogEntry: false,
        compositionParent: "wrappedGift",
      });
      expect(updateCompositionBackButton).toHaveBeenCalledTimes(1);

      options.refreshComposition();
      expect(updateEmojiComposition).toHaveBeenCalledWith(
        { key: "wrappedGift" },
        "🎁",
      );
      options.syncUrlState();
      expect(syncUrlState).toHaveBeenCalledWith();
      options.toggleComposition();
      expect(toggleComposition).toHaveBeenCalledTimes(1);
      options.toggleFavorite();
      expect(toggleFavorite).toHaveBeenCalledWith("wrappedGift");
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, "window", originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });

  it("binds and unbinds event helpers across all exported shortcuts", async () => {
    const wireUp = await import("../../../src/app/emoji/emoji-wire-up.js");

    const createTarget = () => {
      const added: Array<[string, unknown]> = [];
      const removed: Array<[string, unknown]> = [];
      return {
        addEventListener(type: string, handler: unknown) {
          added.push([type, handler]);
        },
        removeEventListener(type: string, handler: unknown) {
          removed.push([type, handler]);
        },
        added,
        removed,
      };
    };

    const clickHandler = () => {};
    const keyHandler = () => {};

    const target = createTarget();
    const cleanup = wireUp.bindEvent("click", target as any, clickHandler);
    expect(target.added).toEqual([["click", clickHandler]]);
    cleanup();
    expect(target.removed).toEqual([["click", clickHandler]]);

    expect(() =>
      wireUp.bindEvent("change", undefined, clickHandler)(),
    ).not.toThrow();

    const clickTarget = createTarget();
    const changeTarget = createTarget();
    const inputTarget = createTarget();
    const closeTarget = createTarget();
    const focusTarget = createTarget();
    const keyTarget = createTarget();
    const onlineTarget = createTarget();
    const offlineTarget = createTarget();

    wireUp.click(clickTarget as any, clickHandler)();
    wireUp.change(changeTarget as any, clickHandler)();
    wireUp.input(inputTarget as any, clickHandler)();
    wireUp.close(closeTarget as any, clickHandler)();
    wireUp.focusIn(focusTarget as any, clickHandler)();
    wireUp.keyDown(keyTarget as any, keyHandler)();
    wireUp.online(onlineTarget as any, clickHandler)();
    wireUp.offline(offlineTarget as any, clickHandler)();

    expect(clickTarget.added).toEqual([["click", clickHandler]]);
    expect(changeTarget.added).toEqual([["change", clickHandler]]);
    expect(inputTarget.added).toEqual([["input", clickHandler]]);
    expect(closeTarget.added).toEqual([["close", clickHandler]]);
    expect(focusTarget.added).toEqual([["focusin", clickHandler]]);
    expect(keyTarget.added).toEqual([["keydown", keyHandler]]);
    expect(onlineTarget.added).toEqual([["online", clickHandler]]);
    expect(offlineTarget.added).toEqual([["offline", clickHandler]]);

    expect(clickTarget.removed).toEqual([["click", clickHandler]]);
    expect(changeTarget.removed).toEqual([["change", clickHandler]]);
    expect(inputTarget.removed).toEqual([["input", clickHandler]]);
    expect(closeTarget.removed).toEqual([["close", clickHandler]]);
    expect(focusTarget.removed).toEqual([["focusin", clickHandler]]);
    expect(keyTarget.removed).toEqual([["keydown", keyHandler]]);
    expect(onlineTarget.removed).toEqual([["online", clickHandler]]);
    expect(offlineTarget.removed).toEqual([["offline", clickHandler]]);
  });
});
