import assert from "node:assert/strict";
import { createDialogNavigationController } from "../../../src/explorer/dialog/dialog-navigation-controller.js";

class FakeButton {
  disabled = false;
  hidden = false;
  title = "";
  attributes = new Map<string, string>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const windowStub: any = {
  history: {
    state: {
      compositionParent: "wrappedGift",
      dialogParentPanel: "favorites",
    },
  },
};
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});

try {
  const emojiParent = new FakeButton();
  const emojiNext = new FakeButton();
  const emojiPrevious = new FakeButton();
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
  assert.equal(emojiParent.hidden, false);
  assert.equal(emojiParent.title, "Back to emoji: gift");
  assert.equal(
    emojiParent.getAttribute("aria-label"),
    "Back to emoji: gift",
  );

  controller.update();
  assert.equal(emojiPrevious.disabled, false);
  assert.equal(emojiNext.disabled, false);
  assert.equal(emojiParent.title, "Back to emoji: gift");

  controller.navigate(-1);
  controller.navigate(1);
  assert.deepEqual(showCalls, [
    ["grin", false],
    ["gift", false],
  ]);
  assert.equal(syncCalls, 2);

  let resolveCalls = 0;
  const displayedController = createDialogNavigationController({
    byId: () => ({}),
    currentEmojiKey: () => "wave",
    dialogNavigationKeys: () => [],
    displayedKeys: () => ["wave", "gift"],
    emojiByKey: () => ({ wave: "👋", gift: "🎁" }),
    resolveNavigation: (keys: string[], currentKey: string) => {
      resolveCalls += 1;
      assert.deepEqual(keys, ["wave", "gift"]);
      assert.equal(currentKey, "wave");
      return { previousKey: "", nextKey: "gift" };
    },
    showEmoji: (key: string, openDialog: boolean) => {
      showCalls.push([key, openDialog]);
    },
    syncUrlState: () => {
      syncCalls += 1;
    },
    searchAnnotations: () => ({}),
    translate: (_key: string, fallback: string) => fallback,
  });
  displayedController.navigate(1);
  assert.equal(resolveCalls, 1);
  assert.deepEqual(showCalls.at(-1), ["gift", false]);

  const noKeyController = createDialogNavigationController({
    byId: () => ({}),
    currentEmojiKey: () => "wave",
    dialogNavigationKeys: () => ["wave"],
    displayedKeys: () => ["wave"],
    emojiByKey: () => ({ wave: "👋" }),
    resolveNavigation: () => ({ previousKey: "", nextKey: "" }),
    showEmoji: () => {
      throw new Error("showEmoji should not run when no key is available");
    },
    syncUrlState: () => {
      throw new Error("syncUrlState should not run when no key is available");
    },
    searchAnnotations: () => ({}),
    translate: (_key: string, fallback: string) => fallback,
  });
  noKeyController.navigate(1);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
