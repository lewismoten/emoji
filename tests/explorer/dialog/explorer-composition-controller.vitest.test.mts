import { afterEach, describe, expect, it, vi } from "vitest";

const updateEmojiComposition = vi.fn();

vi.mock("../../../src/explorer/dialog/dialog-render.js", () => ({
  updateEmojiComposition,
}));

describe("explorer-composition-controller", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    updateEmojiComposition.mockReset();
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("passes composition rendering context through to dialog-render helpers", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { documentElement: { dir: "rtl", lang: "ar" } },
    });
    const { updateExplorerComposition } = await import(
      "../../../src/explorer/dialog/explorer-composition-controller.js"
    );
    const dialog = {
      classList: { contains: (name: string) => name === "is-code-view" },
    };
    updateExplorerComposition(
      {
        applyPixelArtworkClass: "applyPixelArtworkClass",
        applyStandalonePixelArtwork: "applyStandalonePixelArtwork",
        byId: () => ({ sparkles: { key: "sparkles" } }),
        compositionMode: () => "full",
        developerModeEnabled: () => true,
        dialog: () => dialog as any,
        emojiByKey: () => ({ sparkles: "✨" }),
        emojiKeyByCodePoints: () => new Map([["2728", "sparkles"]]),
        searchAnnotations: () => ({ sparkles: ["Sparkles"] }),
        selectedLocale: () => "en",
        translate: (key: string) => `translated:${key}`,
      } as any,
      { key: "sparkles" } as any,
      "✨",
    );
    expect(updateEmojiComposition).toHaveBeenCalledTimes(1);
    expect(updateEmojiComposition.mock.calls[0]?.[0]).toMatchObject({
      compositionMode: "full",
      developerMode: true,
      detailsVisible: false,
      dir: "rtl",
      locale: "ar",
      numberingSystem: "arab",
      value: "✨",
    });
  });
});
