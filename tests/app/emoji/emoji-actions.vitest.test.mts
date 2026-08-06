import { afterEach, describe, expect, it } from "vitest";

import { createEmojiActions } from "../../../src/app/emoji/emoji-actions.js";
import * as state from "../../../src/state.js";

describe("emoji-actions", () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    (globalThis as any).window = originalWindow;
    if (originalNavigatorDescriptor) {
      Object.defineProperty(
        globalThis,
        "navigator",
        originalNavigatorDescriptor,
      );
    } else {
      delete (globalThis as any).navigator;
    }
    (globalThis as any).fetch = originalFetch;
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
  });

  it("handles introduced versions, dialog close, click navigation, and code-point lookup", async () => {
    const copyStatus = { textContent: "" };
    const dialog = {
      dataset: { dialogParentPanel: "" },
    };
    (globalThis as any).document = {
      documentElement: { lang: "en", dir: "ltr", dataset: {} },
      querySelector() {
        return null;
      },
    };
    const copiedValues: string[] = [];
    (globalThis as any).window = {
      history: {
        state: { keep: true },
        backCalled: 0,
        back() {
          this.backCalled += 1;
        },
      },
      setTimeout(callback: () => void) {
        callback();
        return 1;
      },
      matchMedia() {
        return { matches: false };
      },
    };
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          async writeText(value: string) {
            copiedValues.push(value);
          },
        },
      },
    });
    const manifest = {
      packs: [{ id: "popular", importPath: "@lewismoten/emoji/popular" }],
      categories: [],
    };
    (globalThis as any).fetch = async () => ({
      ok: true,
      async json() {
        return manifest;
      },
    });
    state.versionKeys.replace(
      new Map([
        ["17.0", new Set(["wrappedGift"])],
        ["18.0", new Set(["futureEmoji"])],
      ]),
    );
    state.versionManifests.set([{ version: "17.0" }] as any);
    state.proposedVersionManifests.set([{ version: "18.0" }] as any);
    state.emojiByKey.replace({ wrappedGift: "🎁" });
    state.items.set([
      { key: "wrappedGift", codePoints: "1F381", status: "fully-qualified" },
      {
        key: "lightSkin",
        codePoints: "1F44D 1F3FB",
        status: "fully-qualified",
      },
    ] as any);
    state.byId.replace({
      wrappedGift: {
        key: "wrappedGift",
        group: "Objects",
        unicodeSubGroup: "money",
      } as any,
    });
    state.searchAnnotations.replace({});
    state.selectedSearchLocale.set("en");

    const showEmojiCalls: any[] = [];
    const syncUrlStateCalls: any[] = [];
    let currentView: any[] = [];

    const actions = createEmojiActions({
      applyingUrlState: () => false,
      applyPixelArtworkClass: () => undefined,
      applyStandalonePixelArtwork: () => undefined,
      copyStatus: () => copyStatus as any,
      developerModeEnabled: () => true,
      dialog: () => dialog as any,
      normalizeCodePoints: (value: string) => value,
      showEmoji: (...args: any[]) => showEmojiCalls.push(args),
      setDialogView: (...args: any[]) => {
        currentView = args;
      },
      suppressDialogCloseSync: () => false,
      syncUrlState: (...args: any[]) => syncUrlStateCalls.push(args),
      translate: (_key: string, fallback: string) => fallback,
      urlStateReady: () => true,
    });

    expect(actions.getIntroducedVersion("wrappedGift")).toBe("17.0");
    expect(actions.getIntroducedVersion("missing")).toBe("—");

    const loadedManifest = await actions.loadPackageManifest();
    expect(loadedManifest).toEqual(manifest);

    await actions.copyToClipboardValue("🎁", "Copied!");
    expect(copiedValues).toEqual(["🎁"]);
    expect(copyStatus.textContent).toBe("Copied!");

    const cell = {
      id: "wrappedGift",
      focusCalled: 0,
      focus() {
        this.focusCalled += 1;
      },
    };
    actions.onClick({
      target: {
        closest: () => cell,
      },
    });
    expect(cell.focusCalled).toBe(1);
    expect(showEmojiCalls[0]).toEqual(["wrappedGift", true]);

    actions.rebuildEmojiCodePointLookup();
    expect(state.emojiKeyByCodePoints.get("1F381")).toBe("wrappedGift");
    expect(state.emojiKeyByCodePoints.get("1F44D 1F3FB")).toBe("lightSkin");

    (globalThis as any).window.history.state = { emojiDialogEntry: true };
    actions.onEmojiDialogClose();
    expect(currentView).toEqual(["details", false]);
    expect(state.currentDialogParentStack.get()).toEqual([]);
    expect(dialog.dataset.dialogParentPanel).toBe("");
    expect((globalThis as any).window.history.backCalled).toBe(1);

    (globalThis as any).window.history.state = {
      emojiDialogEntry: true,
      dialogParentPanel: "favorites",
      keep: true,
      compositionParent: "wrappedGift",
    };
    actions.onEmojiDialogClose();
    expect(syncUrlStateCalls.at(-1)).toEqual([
      "replace",
      { emojiDialogEntry: true, keep: true },
    ]);
  });
});
