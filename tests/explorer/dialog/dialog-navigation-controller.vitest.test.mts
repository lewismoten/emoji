import { afterEach, describe, expect, it } from "vitest";

import { createDialogNavigationController } from "../../../src/explorer/dialog/dialog-navigation-controller.js";

describe("dialog-navigation-controller", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  afterEach(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete (globalThis as any).window;
  });

  it("updates parent/back labels and navigates between dialog entries", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        history: {
          state: {
            compositionParent: "wrappedGift",
            dialogParentPanel: "favorites",
          },
        },
      },
    });

    const button = () => ({
      disabled: false,
      hidden: false,
      title: "",
      attributes: new Map<string, string>(),
      setAttribute(name: string, value: string) {
        this.attributes.set(name, value);
      },
      getAttribute(name: string) {
        return this.attributes.get(name) ?? null;
      },
    });

    const emojiParent = button();
    const emojiNext = button();
    const emojiPrevious = button();
    const showCalls: Array<[string, boolean]> = [];
    let syncCalls = 0;
    const controller = createDialogNavigationController({
      byId: () => ({ wrappedGift: { shortName: "wrapped gift" } }),
      currentDialogParentStack: () => ["help"],
      currentEmojiKey: () => "wave",
      dialog: () => ({ dataset: { dialogParentPanel: "favorites" } }),
      dialogNavigationKeys: () => ["grin", "wave", "gift"],
      displayedKeys: () => ["displayedA", "displayedB"],
      emojiByKey: () => ({ wrappedGift: "🎁", grin: "😀", wave: "👋", gift: "🎁" }),
      emojiNext: () => emojiNext as any,
      emojiParent: () => emojiParent as any,
      emojiPrevious: () => emojiPrevious as any,
      resolveNavigation: (keys: string[], currentKey: string) => ({
        keys,
        currentKey,
        previousKey: "grin",
        nextKey: "gift",
      }),
      searchAnnotations: () => ({ wrappedGift: ["gift"] }),
      showEmoji: (key: string, openDialog: boolean) => {
        showCalls.push([key, openDialog]);
      },
      syncUrlState: () => {
        syncCalls += 1;
      },
      translate: (_key: string, fallback: string) => fallback,
    });

    controller.updateBack();
    expect(emojiParent.hidden).toBe(false);
    controller.update();
    expect(emojiPrevious.disabled).toBe(false);
    expect(emojiNext.disabled).toBe(false);
    controller.navigate(-1);
    controller.navigate(1);
    expect(showCalls).toEqual([
      ["grin", false],
      ["gift", false],
    ]);
    expect(syncCalls).toBe(2);
  });
});
