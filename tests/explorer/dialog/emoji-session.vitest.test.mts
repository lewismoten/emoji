import { afterEach, describe, expect, it, vi } from "vitest";

import * as state from "../../../src/state.js";

const renderEmojiDialog = vi.fn((options: any) => ({
  copyValues: ["copied", options.id],
}));

vi.mock("../../../src/explorer/dialog/dialog-render.js", () => ({
  renderEmojiDialog,
}));

describe("emoji-session", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    renderEmojiDialog.mockClear();
    state.emojiByKey.clear();
    state.byId.clear();
    state.currentDialogParentStack.set([]);
    state.currentEmojiCopies.clear();
    state.currentEmojiKey.set("");
    state.dialogNavigationKeys.set([]);
    state.displayedKeys.set([]);
    state.searchAnnotations.clear();
    state.selectedSearchLocale.set("");
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else delete (globalThis as any).document;
  });

  it("renders emoji sessions and updates dialog state", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { documentElement: { lang: "ar" } },
    });
    state.emojiByKey.replace({ wrappedGift: "🎁", smile: "😀" });
    state.byId.replace({ wrappedGift: { status: "fully-qualified" } as any });
    state.currentDialogParentStack.set(["stale"]);
    state.currentEmojiCopies.clear();
    state.currentEmojiKey.set("before");
    state.dialogNavigationKeys.set(["before"]);
    state.displayedKeys.set(["smile", "wrappedGift", "missing"]);
    state.searchAnnotations.replace({ wrappedGift: ["gift"] });
    state.selectedSearchLocale.set("en-GB");
    const { showEmojiSession } = await import("../../../src/explorer/dialog/emoji-session.js");
    const options: any = {
      id: "wrappedGift",
      items: [{ key: "wrappedGift", group: "Activities", unicodeSubGroup: "event" }],
      applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
      applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
      compositionMode: "full",
      developerMode: true,
      displayGroupName: (value: string) => `group:${value}`,
      displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
      dialog: { classList: { contains: (name: string) => name === "is-editor-view" } },
      getIntroducedVersion: (value: string) => `v:${value}`,
      openDialog: true,
      openDialogActionCalls: [] as any[],
      openDialogAction(mode: string, panel: string) {
        this.openDialogActionCalls.push([mode, panel]);
      },
      openEditorCalls: [] as any[],
      openEditor(key: string, value: string) {
        this.openEditorCalls.push([key, value]);
      },
      updateDialogNavigationCalls: 0,
      updateDialogNavigation() {
        this.updateDialogNavigationCalls += 1;
      },
      sequenceTranslationKeys: {},
      sequenceTypeLabels: {},
      statusTranslationKeys: {},
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
      updateFavoriteButton: Symbol("updateFavoriteButton"),
      updateRenderingDiagnostic: Symbol("updateRenderingDiagnostic"),
      updateEmojiComposition: Symbol("updateEmojiComposition"),
      parentPanel: "favorites",
      initialMode: "code",
    };
    showEmojiSession(options);
    expect(state.currentEmojiKey.get()).toBe("wrappedGift");
    expect(state.currentDialogParentStack.get()).toEqual(["favorites"]);
    expect(state.currentEmojiCopies.get()).toEqual(["copied", "wrappedGift"]);
    expect(state.dialogNavigationKeys.get()).toEqual(["smile", "wrappedGift"]);
    expect(renderEmojiDialog).toHaveBeenCalled();
  });
});
