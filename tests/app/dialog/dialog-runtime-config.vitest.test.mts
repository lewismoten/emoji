import { describe, expect, it, vi } from "vitest";

const initializeDialogRuntime = vi.fn((options: any) => ({
  kind: "runtime",
  options,
}));

vi.mock("../../../src/app/dialog/dialog-runtime.js", () => ({
  initializeDialogRuntime,
}));

describe("createDialogRuntimeConfig", () => {
  it("forwards dialog runtime config into initializeDialogRuntime", async () => {
    const { createDialogRuntimeConfig } =
      await import("../../../src/app/dialog/dialog-runtime-config.js");

    const copyStatus = { textContent: "copied" };
    const dialog = { open: false };
    const callbackCalls: Array<[string, unknown[]]> = [];

    const config = createDialogRuntimeConfig({
      applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
      applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
      copyStatus: () => copyStatus,
      developerModeEnabled: () => true,
      fullDeveloperModeEnabled: () => false,
      dialog: () => dialog,
      displayGroupName: (value: string) => `group:${value}`,
      displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
      emojiNext: () => "wave",
      emojiParent: () => "favorites",
      emojiPrevious: () => "smile",
      focusInitialAction: Symbol("focusInitialAction"),
      getIntroducedVersion: (value: string) => `v:${value}`,
      openEditor: (key: string, value: string) => {
        callbackCalls.push(["openEditor", [key, value]]);
        return `${key}:${value}`;
      },
      sequenceTranslationKeys: { zwj: "zwj" },
      sequenceTypeLabels: { zwj: "ZWJ" },
      setCurrentDialogParentStack: (value: string[]) => {
        callbackCalls.push(["setCurrentDialogParentStack", [value]]);
        return value.length;
      },
      setDialogView: (...args: unknown[]) => {
        callbackCalls.push(["setDialogView", args]);
        return args.length;
      },
      statusTranslationKeys: { fullyQualified: "fullyQualified" },
      syncUrlState: (...args: unknown[]) => {
        callbackCalls.push(["syncUrlState", args]);
        return args.join(":");
      },
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
      updateCompositionBackButton: (...args: unknown[]) => {
        callbackCalls.push(["updateCompositionBackButton", args]);
        return args.at(0);
      },
      updateDialogNavigation: (...args: unknown[]) => {
        callbackCalls.push(["updateDialogNavigation", args]);
        return args.at(-1);
      },
      updateEmojiComposition: Symbol("updateEmojiComposition"),
      updateFavoriteButton: Symbol("updateFavoriteButton"),
      updateRenderingDiagnostic: Symbol("updateRenderingDiagnostic"),
    });

    expect(config).toEqual({
      kind: "runtime",
      options: initializeDialogRuntime.mock.calls[0]![0],
    });

    const forwarded = initializeDialogRuntime.mock.calls[0]![0];
    expect(forwarded.applyPixelArtworkClass.description).toBe(
      "applyPixelArtworkClass",
    );
    expect(forwarded.applyStandalonePixelArtwork.description).toBe(
      "applyStandalonePixelArtwork",
    );
    expect(forwarded.copyStatus()).toBe(copyStatus);
    expect(forwarded.developerModeEnabled()).toBe(true);
    expect(forwarded.fullDeveloperModeEnabled()).toBe(false);
    expect(forwarded.dialog()).toBe(dialog);
    expect(forwarded.displayGroupName("Smileys")).toBe("group:Smileys");
    expect(forwarded.displayUnicodeSubGroupName("face-smiling")).toBe(
      "sub:face-smiling",
    );
    expect(forwarded.emojiNext()).toBe("wave");
    expect(forwarded.emojiParent()).toBe("favorites");
    expect(forwarded.emojiPrevious()).toBe("smile");
    expect(forwarded.focusInitialAction.description).toBe("focusInitialAction");
    expect(forwarded.getIntroducedVersion("grin")).toBe("v:grin");
    expect(forwarded.sequenceTranslationKeys).toEqual({ zwj: "zwj" });
    expect(forwarded.sequenceTypeLabels).toEqual({ zwj: "ZWJ" });
    expect(forwarded.statusTranslationKeys).toEqual({
      fullyQualified: "fullyQualified",
    });
    expect(forwarded.translate("group", "Group")).toBe("group:Group");
    expect(forwarded.updateEmojiComposition.description).toBe(
      "updateEmojiComposition",
    );
    expect(forwarded.updateFavoriteButton.description).toBe(
      "updateFavoriteButton",
    );
    expect(forwarded.updateRenderingDiagnostic.description).toBe(
      "updateRenderingDiagnostic",
    );

    expect(forwarded.openEditor("grin", "editor")).toBe("grin:editor");
    expect(forwarded.setCurrentDialogParentStack(["help", "language"])).toBe(2);
    expect(forwarded.setDialogView("emoji", "code")).toBe(2);
    expect(forwarded.syncUrlState("emoji", "grin")).toBe("emoji:grin");
    expect(forwarded.updateCompositionBackButton("back")).toBe("back");
    expect(forwarded.updateDialogNavigation("prev", "next")).toBe("next");
    expect(callbackCalls).toEqual([
      ["openEditor", ["grin", "editor"]],
      ["setCurrentDialogParentStack", [["help", "language"]]],
      ["setDialogView", ["emoji", "code"]],
      ["syncUrlState", ["emoji", "grin"]],
      ["updateCompositionBackButton", ["back"]],
      ["updateDialogNavigation", ["prev", "next"]],
    ]);
  });
});
