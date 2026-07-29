import assert from "node:assert/strict";
import { createListController } from "../../src/explorer/list-controller.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

try {
  const timers = new Map<number, () => void>();
  let nextTimerId = 1;
  const cleared: number[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      clearTimeout(id: number) {
        cleared.push(id);
        timers.delete(id);
      },
      setTimeout(callback: () => void) {
        const id = nextTimerId++;
        timers.set(id, callback);
        return id;
      },
    },
  });

  let focusedCell: { id: string } | null = { id: "active" };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      activeElement: {
        closest(selector: string) {
          return selector === "[data-emoji-key]" ? focusedCell : null;
        },
      },
    },
  });

  const searchInput = {
    focused: false,
    value: "alpha",
    focus() {
      this.focused = true;
    },
  };
  const hair = [{ checked: false, value: "1F9B0" }] as any;
  const skin = [{ checked: true, value: "1F3FB" }] as any;
  const gender = [{ checked: true, value: "neutral" }] as any;
  const displayedKeys: string[][] = [];
  const renderCalls: Array<[string[], boolean]> = [];
  const focusedKeys: string[] = [];
  const matchCount = { innerText: "" };
  let focusedEmojiKey = "";
  let items = [
    { key: "alpha", codePoints: "1F468 1F3FB", shortName: "person alpha" },
    { key: "beta", codePoints: "1F9D1 1F3FB", shortName: "person beta" },
    { key: "gamma", codePoints: "1F469", shortName: "woman gamma" },
  ];
  let syncCalls = 0;
  let summaryCalls = 0;
  let navigationCalls = 0;
  let generation = 0;

  const controller = createListController({
    allIds: () => ["alpha", "beta", "gamma"],
    byId: () => ({
      alpha: {
        codePoints: "1F468 1F3FB",
        group: "Objects",
        key: "alpha",
        order: 1,
        shortName: "person alpha",
        subGroup: "mail",
        unicodeSubGroup: "mail",
      },
      beta: {
        codePoints: "1F9D1 1F3FB",
        group: "Objects",
        key: "beta",
        order: 2,
        shortName: "person beta",
        subGroup: "mail",
        unicodeSubGroup: "mail",
      },
      gamma: {
        codePoints: "1F469",
        group: "Smileys & Emotion",
        key: "gamma",
        order: 3,
        shortName: "woman gamma",
        subGroup: "face",
        unicodeSubGroup: "face",
      },
    }),
    emojiByKey: () => ({ alpha: "😀", beta: "😎", gamma: "😇" }),
    formatNumber: (value: number) => `#${value}`,
    genderCheckboxes: () => gender,
    getVersionKeys: () => new Set(["alpha", "beta"]),
    hairCheckboxes: () => hair,
    items: () => items,
    nextRenderGeneration: () => ++generation,
    focusedEmojiKey: () => focusedEmojiKey,
    matchCount: () => matchCount,
    orderedKeys: (keys: string[]) => [...keys].reverse(),
    orderMode: () => "unicode",
    popularKeys: () => ["beta", "alpha", "gamma"],
    renderEmojiList(keys: string[], restore: boolean) {
      renderCalls.push([keys, restore]);
    },
    searchAnnotations: () => ({ alpha: ["grinning face"] }),
    searchText: () => searchInput as any,
    selectedGroup: () => "Objects",
    selectedSequenceType: () => "",
    selectedSearchLocale: () => "en",
    selectedSubGroup: () => "Objects:mail",
    setDisplayedKeys(keys: string[]) {
      displayedKeys.push(keys);
    },
    setFocusedEmojiKey(key: string) {
      focusedKeys.push(key);
      focusedEmojiKey = key;
    },
    skinToneCheckboxes: () => skin,
    subGroupSelectionKey: (group: string, subGroup: string) =>
      `${group}:${subGroup}`,
    syncUrlState() {
      syncCalls += 1;
    },
    updateDialogNavigation() {
      navigationCalls += 1;
    },
    updateFilterSummary() {
      summaryCalls += 1;
    },
  });

  controller.draw();
  assert.deepEqual(displayedKeys[0], ["alpha"]);
  assert.deepEqual(renderCalls[0], [["alpha"], true]);
  assert.equal(matchCount.innerText, "#1");
  assert.deepEqual(focusedKeys, ["alpha"]);
  assert.equal(summaryCalls, 1);
  assert.equal(navigationCalls, 1);
  assert.equal(syncCalls, 1);

  focusedCell = null;
  searchInput.value = "";
  focusedEmojiKey = "missing";
  items = [
    { key: "alpha", codePoints: "1F468 1F3FB", shortName: "person alpha" },
    { key: "beta", codePoints: "1F9D1 1F3FB", shortName: "person beta" },
    { key: "gamma", codePoints: "1F469", shortName: "woman gamma" },
  ];
  controller.draw();
  assert.deepEqual(displayedKeys[1], ["beta", "alpha"]);
  assert.deepEqual(renderCalls[1], [["beta", "alpha"], false]);
  assert.equal(matchCount.innerText, "#2");
  assert.equal(focusedEmojiKey, "beta");

  controller.schedule();
  controller.schedule();
  assert.deepEqual(cleared, [1]);
  controller.draw();
  assert.deepEqual(cleared, [1, 2]);
  controller.schedule();
  assert.deepEqual(cleared, [1, 2]);
  timers.get(3)?.();
  assert.equal(renderCalls.length, 4);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
