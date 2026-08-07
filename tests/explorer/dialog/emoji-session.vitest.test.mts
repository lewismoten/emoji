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
    state.searchAnnotations.clear();
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
    state.searchAnnotations.replace({ wrappedGift: ["gift"] });
    const { showEmojiSession } = await import("../../../src/explorer/dialog/emoji-session.js");
    const options: any = {
      id: "wrappedGift",
      items: [{ key: "wrappedGift", group: "Activities", unicodeSubGroup: "event" }],
      applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
      applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
      compositionMode: "full",
      developerMode: true,
      dialogNavigationKeys: { value: ["before"] },
      displayedKeys: { value: ["smile", "wrappedGift", "missing"] },
      displayGroupName: (value: string) => `group:${value}`,
      displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
      dialog: { classList: { contains: (name: string) => name === "is-editor-view" } },
      getIntroducedVersion: (value: string) => `v:${value}`,
      currentEmojiKey: { value: "before" },
      currentDialogParentStack: { value: ["stale"] },
      currentEmojiCopies: { value: [] },
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
      selectedSearchLocale: "en-GB",
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
    expect(options.currentEmojiKey.value).toBe("wrappedGift");
    expect(options.currentDialogParentStack.value).toEqual(["favorites"]);
    expect(options.currentEmojiCopies.value).toEqual(["copied", "wrappedGift"]);
    expect(renderEmojiDialog).toHaveBeenCalled();
  });
});
