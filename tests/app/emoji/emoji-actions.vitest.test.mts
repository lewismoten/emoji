import { afterEach, describe, expect, it, vi } from "vitest";

import * as state from "../../../src/state.js";

const getIntroducedVersionHelper = vi.fn();
const withoutDialogParentPanel = vi.fn((value) => ({
  ...value,
  dialogParentPanelRemoved: true,
}));
const withoutCompositionParent = vi.fn((value) => ({
  ...value,
  compositionParentRemoved: true,
}));
const loadPackageManifestHelper = vi.fn();
const renderImportExamplesHelper = vi.fn();
const updateExplorerComposition = vi.fn();
const copyToClipboard = vi.fn();

vi.mock("../../../src/explorer/dialog/dialog-runtime-helpers.js", () => ({
  getIntroducedVersion: getIntroducedVersionHelper,
  withoutCompositionParent,
  withoutDialogParentPanel,
}));
vi.mock("../../../src/explorer/emoji/import-examples.js", () => ({
  loadPackageManifest: loadPackageManifestHelper,
  renderImportExamples: renderImportExamplesHelper,
}));
vi.mock(
  "../../../src/explorer/dialog/explorer-composition-controller.js",
  () => ({
    updateExplorerComposition,
  }),
);
vi.mock("../../../src/explorer/saved-emoji.js", () => ({
  copyToClipboard,
}));

describe("emoji-actions", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    state.packageManifest.set({ packs: [], categories: [] } as any);
    state.packageManifestPromise.set(undefined);
    state.versionKeys.replace(new Map());
    state.versionManifests.set([]);
    state.proposedVersionManifests.set([]);
    state.emojiByKey.replace({});
    state.items.set([]);
    state.byId.replace({});
    state.currentDialogParentStack.set([]);
    state.compositionMode.set("condensed");
    state.searchAnnotations.replace({});
    state.selectedSearchLocale.set("");
    state.emojiKeyByCodePoints.replace(new Map());
    vi.clearAllMocks();
  });

  it("wires helper-driven actions through shared state", async () => {
    const { createEmojiActions } =
      await import("../../../src/app/emoji/emoji-actions.js");

    const copyStatus = { textContent: "" };
    const dialog = {
      dataset: { dialogParentPanel: "" },
    };
    const manifest = { packs: [{ id: "popular" }], categories: [] };

    getIntroducedVersionHelper.mockReturnValue("17.0");
    loadPackageManifestHelper.mockResolvedValue(manifest);
    copyToClipboard.mockResolvedValue(undefined);
    updateExplorerComposition.mockReturnValue("composition-result");

    state.packageManifest.set(manifest as any);
    state.packageManifestPromise.set(Promise.resolve(manifest) as any);
    state.versionKeys.replace(new Map([["17.0", new Set(["wrappedGift"])]]));
    state.versionManifests.set([{ version: "17.0" }] as any);
    state.proposedVersionManifests.set([{ version: "18.0" }] as any);
    state.emojiByKey.replace({ wrappedGift: "🎁" });
    state.byId.replace({ wrappedGift: { key: "wrappedGift" } as any });
    state.compositionMode.set("condensed" as any);
    state.selectedSearchLocale.set("en");
    state.items.set([
      { key: "variant", codePoints: "1F44D", status: "minimally-qualified" },
      { key: "preferred", codePoints: "1F44D", status: "fully-qualified" },
      {
        key: "lightSkin",
        codePoints: "1F44D 1F3FB",
        status: "fully-qualified",
      },
      { key: "missingCodePoints", codePoints: "", status: "fully-qualified" },
    ] as any);

    const showEmojiCalls: any[] = [];
    let currentView: any[] = [];
    const syncUrlStateCalls: any[] = [];

    const actions = createEmojiActions({
      applyingUrlState: () => false,
      applyPixelArtworkClass: () => "pixel-artwork-class",
      applyStandalonePixelArtwork: () => "standalone-pixel-artwork",
      copyStatus: () => copyStatus as any,
      developerModeEnabled: () => true,
      dialog: () => dialog as any,
      normalizeCodePoints: (value: string) => value.trim(),
      setDialogView: (...args: any[]) => {
        currentView = args;
      },
      showEmoji: (...args: any[]) => showEmojiCalls.push(args),
      suppressDialogCloseSync: () => false,
      syncUrlState: (...args: any[]) => syncUrlStateCalls.push(args),
      translate: (key: string, fallback: string) => `${fallback}:${key}`,
      urlStateReady: () => true,
    });

    expect(actions.getIntroducedVersion("wrappedGift")).toBe("17.0");
    expect(getIntroducedVersionHelper).toHaveBeenCalledWith({
      key: "wrappedGift",
      proposedVersionManifests: [{ version: "18.0" }],
      versionKeys: new Map([["17.0", new Set(["wrappedGift"])]]),
      versionManifests: [{ version: "17.0" }],
    });

    await expect(actions.loadPackageManifest()).resolves.toEqual(manifest);
    expect(loadPackageManifestHelper).toHaveBeenCalledWith({
      getManifest: state.packageManifest.get,
      getPromise: state.packageManifestPromise.get,
      setManifest: state.packageManifest.set,
      setPromise: state.packageManifestPromise.set,
    });

    actions.updateEmojiImportExamples({ key: "wrappedGift" });
    expect(renderImportExamplesHelper).toHaveBeenCalledWith(manifest, {
      key: "wrappedGift",
    });

    await actions.copyToClipboardValue("🎁", "Copied!");
    expect(copyToClipboard).toHaveBeenCalledWith({
      copyStatus,
      successMessage: "Copied!",
      translate: expect.any(Function),
      value: "🎁",
    });

    expect(actions.updateEmojiComposition({ key: "wrappedGift" }, "🎁")).toBe(
      "composition-result",
    );
    expect(updateExplorerComposition).toHaveBeenCalledWith(
      {
        applyPixelArtworkClass: "pixel-artwork-class",
        applyStandalonePixelArtwork: "standalone-pixel-artwork",
        compositionMode: state.compositionMode.get,
        developerModeEnabled: expect.any(Function),
        dialog: expect.any(Function),
        emojiKeyByCodePoints: state.emojiKeyByCodePoints.get,
        selectedLocale: state.selectedSearchLocale.get,
        translate: expect.any(Function),
      },
      { key: "wrappedGift" },
      "🎁",
    );

    const cell = {
      focusCalled: 0,
      id: "wrappedGift",
      focus() {
        this.focusCalled += 1;
      },
    };
    actions.onClick({
      target: {
        closest: () => cell,
        id: "",
      },
    });
    expect(cell.focusCalled).toBe(1);
    expect(showEmojiCalls).toEqual([["wrappedGift", true]]);

    actions.onClick(
      {
        target: {
          closest: () => undefined,
          id: "wrappedGift",
        },
      },
      false,
    );
    expect(showEmojiCalls.at(-1)).toEqual(["wrappedGift", false]);

    actions.onClick({
      target: {
        closest: () => ({ id: "missing", focus() {} }),
        id: "missing",
      },
    });
    expect(showEmojiCalls).toHaveLength(2);

    actions.rebuildEmojiCodePointLookup();
    expect(state.emojiKeyByCodePoints.get("1F44D")).toBe("preferred");
    expect(state.emojiKeyByCodePoints.get("1F44D 1F3FB")).toBe("lightSkin");
    expect(state.emojiKeyByCodePoints.get().has("")).toBe(false);

    (globalThis as any).window = {
      history: {
        back: vi.fn(),
        state: { emojiDialogEntry: true },
      },
    };
    actions.onEmojiDialogClose();
    expect(currentView).toEqual(["details", false]);
    expect(state.currentDialogParentStack.get()).toEqual([]);
    expect(dialog.dataset.dialogParentPanel).toBe("");
    expect(globalThis.window.history.back).toHaveBeenCalledTimes(1);

    (globalThis.window.history as any).state = {
      compositionParent: "wrappedGift",
      dialogParentPanel: "favorites",
      emojiDialogEntry: true,
      keep: true,
    };
    actions.onEmojiDialogClose();
    expect(withoutCompositionParent).toHaveBeenCalledWith(
      globalThis.window.history.state,
    );
    expect(withoutDialogParentPanel).toHaveBeenCalledWith({
      compositionParent: "wrappedGift",
      compositionParentRemoved: true,
      dialogParentPanel: "favorites",
      emojiDialogEntry: true,
      keep: true,
    });
    expect(syncUrlStateCalls.at(-1)).toEqual([
      "replace",
      {
        compositionParent: "wrappedGift",
        compositionParentRemoved: true,
        dialogParentPanel: "favorites",
        dialogParentPanelRemoved: true,
        emojiDialogEntry: true,
        keep: true,
      },
    ]);
  });

  it("skips dialog-close sync when url state should not be touched", async () => {
    const { createEmojiActions } =
      await import("../../../src/app/emoji/emoji-actions.js");

    const syncUrlState = vi.fn();
    const dialog = {
      dataset: { dialogParentPanel: "favorites" },
    };
    (globalThis as any).window = {
      history: {
        back: vi.fn(),
        state: { emojiDialogEntry: true, dialogParentPanel: "favorites" },
      },
    };

    for (const flags of [
      {
        applyingUrlState: () => false,
        suppressDialogCloseSync: () => true,
        urlStateReady: () => true,
      },
      {
        applyingUrlState: () => false,
        suppressDialogCloseSync: () => false,
        urlStateReady: () => false,
      },
      {
        applyingUrlState: () => true,
        suppressDialogCloseSync: () => false,
        urlStateReady: () => true,
      },
    ]) {
      const actions = createEmojiActions({
        ...flags,
        applyPixelArtworkClass: () => undefined,
        applyStandalonePixelArtwork: () => undefined,
        copyStatus: () => ({}) as any,
        developerModeEnabled: () => false,
        dialog: () => dialog as any,
        normalizeCodePoints: (value: string) => value,
        setDialogView: vi.fn(),
        showEmoji: vi.fn(),
        syncUrlState,
        translate: (_key: string, fallback: string) => fallback,
      });

      actions.onEmojiDialogClose();
    }

    expect(syncUrlState).not.toHaveBeenCalled();
    expect(globalThis.window.history.back).not.toHaveBeenCalled();
    expect(dialog.dataset.dialogParentPanel).toBe("");
  });
});
