import { afterEach, describe, expect, it } from "vitest";

import * as state from "../../../../src/state.js";
import { createListController } from "../../../../src/explorer/emoji/list-controller.js";

describe("list-controller direct", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    state.byId.clear();
    state.searchAnnotations.clear();
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
  });

  it("draws filtered results and debounces scheduled renders", () => {
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
    state.byId.replace({
      alpha: {
        codePoints: "1F468 1F3FB",
        group: "Objects",
        key: "alpha",
        order: 1,
        shortName: "person alpha",
        unicodeSubGroup: "mail",
      } as any,
      beta: {
        codePoints: "1F9D1 1F3FB",
        group: "Objects",
        key: "beta",
        order: 2,
        shortName: "person beta",
        unicodeSubGroup: "mail",
      } as any,
      gamma: {
        codePoints: "1F469",
        group: "Smileys & Emotion",
        key: "gamma",
        order: 3,
        shortName: "woman gamma",
        unicodeSubGroup: "face",
      } as any,
    });
    state.searchAnnotations.replace({ alpha: ["grinning face"] });

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
    expect(displayedKeys[0]).toEqual(["alpha"]);
    expect(renderCalls[0]).toEqual([["alpha"], true]);
    expect(matchCount.innerText).toBe("#1");
    expect(focusedKeys).toEqual(["alpha"]);
    expect(summaryCalls).toBe(1);
    expect(navigationCalls).toBe(1);
    expect(syncCalls).toBe(1);

    focusedCell = null;
    searchInput.value = "";
    focusedEmojiKey = "missing";
    items = [
      { key: "alpha", codePoints: "1F468 1F3FB", shortName: "person alpha" },
      { key: "beta", codePoints: "1F9D1 1F3FB", shortName: "person beta" },
      { key: "gamma", codePoints: "1F469", shortName: "woman gamma" },
    ];
    controller.draw();
    expect(displayedKeys[1]).toEqual(["beta", "alpha"]);
    expect(renderCalls[1]).toEqual([["beta", "alpha"], false]);
    expect(matchCount.innerText).toBe("#2");
    expect(focusedEmojiKey).toBe("beta");

    controller.schedule();
    controller.schedule();
    expect(cleared).toEqual([1]);
    controller.draw();
    expect(cleared).toEqual([1, 2]);
    controller.schedule();
    expect(cleared).toEqual([1, 2]);
    timers.get(3)?.();
    expect(renderCalls).toHaveLength(4);
  });
});
