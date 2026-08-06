import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createEmojiListInteraction } from "../../../src/explorer/emoji/emoji-list-interaction.js";
import {
  FakeElement,
  installEmojiListInteractionRuntime,
} from "./interaction/emoji-list-interaction-fixture.js";

describe("emoji-list-interaction", () => {
  it("renders empty and populated states and handles keyboard/focus interaction", async () => {
    const runtime = installEmojiListInteractionRuntime();

    try {
      const { focusedById, timers } = runtime;

      const emojiList = new FakeElement("div");
      emojiList.dataset = {};
      const listCells = [
        new FakeElement("button"),
        new FakeElement("button"),
        new FakeElement("button"),
      ];
      listCells[0].id = "alpha";
      listCells[0].dataset.emojiKey = "alpha";
      listCells[1].id = "beta";
      listCells[1].dataset.emojiKey = "beta";
      listCells[2].id = "gamma";
      listCells[2].dataset.emojiKey = "gamma";
      listCells[0].rect = { left: 0, top: 0, width: 10, height: 10 };
      listCells[1].rect = { left: 20, top: 0, width: 10, height: 10 };
      listCells[2].rect = { left: 0, top: 20, width: 10, height: 10 };
      emojiList.childNodes = listCells;
      (emojiList as any).querySelectorAll = () => listCells;
      focusedById.set("alpha", listCells[0]);
      focusedById.set("beta", listCells[1]);
      focusedById.set("gamma", listCells[2]);

      const searchText = {
        value: " query ",
        focused: false,
        focus() {
          this.focused = true;
        },
      };
      let focusedKey = "beta";
      const clicked: string[] = [];
      const renderedStates: any[] = [];
      const interaction = createEmojiListInteraction({
        asItem(state: any, key: string) {
          state.items.push({ key });
          renderedStates.push(["item", key]);
        },
        asSequenceItem(state: any, key: string) {
          state.items.push({ key });
          renderedStates.push(["sequence", key]);
        },
        drawList() {
          clicked.push("draw");
        },
        emojiList: () => emojiList as any,
        flushEmojiCellFragment() {},
        focusedEmojiKey: () => focusedKey,
        getDisplayedKeys: () => ["alpha", "beta", "gamma"],
        nextRenderGeneration: () => 1,
        onClick() {
          clicked.push("click");
        },
        orderMode: () => "unicode",
        renderGeneration: () => 1,
        resetFilters() {
          clicked.push("reset");
        },
        revealExplorer() {
          clicked.push("reveal");
        },
        searchText: () => searchText as any,
        setFocusedEmojiKey(key: string) {
          focusedKey = key;
        },
        translate: (_key: string, fallback: string) => fallback,
        unassigned: "unassigned",
      });

      interaction.renderEmojiList([], true);
      assert.equal(emojiList.dataset.rendering, undefined);
      const emptySection = emojiList.childNodes[0]?.childNodes?.[0];
      assert.equal(emptySection?.className, "empty-results");

      const clearSearchButton = emptySection.childNodes[2].childNodes[0];
      clearSearchButton.listeners.get("click")?.();
      assert.equal(searchText.value, "");
      assert.equal(searchText.focused, true);
      const resetButton = emptySection.childNodes[2].childNodes.at(-1);
      resetButton.listeners.get("click")?.();
      assert.equal(clicked.includes("reset"), true);

      interaction.renderEmojiList(["alpha", "beta"], true);
      assert.equal(emojiList.attributes.get("aria-busy"), "true");
      assert.deepEqual(renderedStates, [
        ["item", "alpha"],
        ["item", "beta"],
      ]);
      assert.equal(clicked.includes("reveal"), true);
      assert.equal(listCells[1].focused, true);
      assert.equal(runtime.yielded, 0);

      const sequenceInteraction = createEmojiListInteraction({
        asItem(state: any, key: string) {
          state.items.push({ key });
        },
        asSequenceItem(state: any, key: string) {
          renderedStates.push(["sequence", state.type ?? "", key]);
          state.items.push({ key });
        },
        drawList() {},
        emojiList: () => emojiList as any,
        flushEmojiCellFragment() {},
        focusedEmojiKey: () => focusedKey,
        getDisplayedKeys: () => ["alpha", "beta", "gamma"],
        nextRenderGeneration: () => 1,
        onClick() {},
        orderMode: () => "sequence",
        renderGeneration: () => 1,
        resetFilters() {},
        revealExplorer() {},
        searchText: () => searchText as any,
        setFocusedEmojiKey(key: string) {
          focusedKey = key;
        },
        translate: (_key: string, fallback: string) => fallback,
        unassigned: "unassigned",
      });
      sequenceInteraction.renderEmojiList(["alpha"], false);
      assert.deepEqual(renderedStates.at(-1), ["sequence", "", "alpha"]);

      const schedulerChunkStates: string[] = [];
      const schedulerChunkInteraction = createEmojiListInteraction({
        asItem(state: any, key: string) {
          state.items.push({ key });
          schedulerChunkStates.push(key);
        },
        asSequenceItem() {},
        drawList() {},
        emojiList: () => emojiList as any,
        flushEmojiCellFragment() {},
        focusedEmojiKey: () => focusedKey,
        getDisplayedKeys: () => [],
        nextRenderGeneration: () => 1,
        onClick() {},
        orderMode: () => "unicode",
        renderGeneration: () => 1,
        resetFilters() {},
        revealExplorer() {},
        searchText: () => searchText as any,
        setFocusedEmojiKey() {},
        translate: (_key: string, fallback: string) => fallback,
        unassigned: "unassigned",
      });
      schedulerChunkInteraction.renderEmojiList(
        Array.from({ length: 121 }, (_, index) => `scheduler-${index}`),
        false,
      );
      await Promise.resolve();
      assert.equal(runtime.yielded > 0, true);
      assert.equal(schedulerChunkStates.length, 121);

      (globalThis as any).window.scheduler = undefined;
      const chunkStates: string[] = [];
      const chunkInteraction = createEmojiListInteraction({
        asItem(state: any, key: string) {
          state.items.push({ key });
          chunkStates.push(key);
        },
        asSequenceItem() {},
        drawList() {},
        emojiList: () => emojiList as any,
        flushEmojiCellFragment() {},
        focusedEmojiKey: () => focusedKey,
        getDisplayedKeys: () => [],
        nextRenderGeneration: () => 1,
        onClick() {},
        orderMode: () => "unicode",
        renderGeneration: () => 1,
        resetFilters() {},
        revealExplorer() {},
        searchText: () => searchText as any,
        setFocusedEmojiKey() {},
        translate: (_key: string, fallback: string) => fallback,
        unassigned: "unassigned",
      });
      chunkInteraction.renderEmojiList(
        Array.from({ length: 121 }, (_, index) => `key-${index}`),
        false,
      );
      assert.equal(timers.length > 0, true);
      while (timers.length > 0) {
        timers.shift()?.();
        await Promise.resolve();
      }
      assert.equal(chunkStates.length, 121);
      runtime.setScheduler({
        yield() {
          return Promise.resolve();
        },
      });

      const canceledInteraction = createEmojiListInteraction({
        asItem(state: any, key: string) {
          state.items.push({ key });
        },
        asSequenceItem() {},
        drawList() {},
        emojiList: () => emojiList as any,
        flushEmojiCellFragment() {},
        focusedEmojiKey: () => focusedKey,
        getDisplayedKeys: () => [],
        nextRenderGeneration: () => 2,
        onClick() {},
        orderMode: () => "unicode",
        renderGeneration: () => 3,
        resetFilters() {},
        revealExplorer() {
          clicked.push("should-not-render");
        },
        searchText: () => searchText as any,
        setFocusedEmojiKey() {},
        translate: (_key: string, fallback: string) => fallback,
        unassigned: "unassigned",
      });
      canceledInteraction.renderEmojiList(["alpha"], true);
      assert.equal(clicked.includes("should-not-render"), false);

      const documentDescriptor = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
      );
      try {
        Reflect.deleteProperty(globalThis, "document");
        const documentlessInteraction = createEmojiListInteraction({
          asItem() {},
          asSequenceItem() {},
          drawList() {},
          emojiList: () => emojiList as any,
          flushEmojiCellFragment() {},
          focusedEmojiKey: () => focusedKey,
          getDisplayedKeys: () => [],
          nextRenderGeneration: () => 1,
          onClick() {},
          orderMode: () => "unicode",
          renderGeneration: () => 1,
          resetFilters() {},
          revealExplorer() {},
          searchText: () => searchText as any,
          setFocusedEmojiKey() {},
          translate: (_key: string, fallback: string) => fallback,
          unassigned: "unassigned",
        });
        assert.doesNotThrow(() =>
          documentlessInteraction.renderEmojiList([], false),
        );
      } finally {
        if (documentDescriptor)
          Object.defineProperty(globalThis, "document", documentDescriptor);
      }

      interaction.onEmojiFocus({
        target: listCells[2],
      } as any);
      assert.equal(focusedKey, "gamma");
      assert.deepEqual(
        listCells.map((cell) => cell.tabIndex),
        [-1, -1, 0],
      );
      interaction.onEmojiFocus({
        target: {
          closest: () => ({
            dataset: {},
          }),
        },
      } as any);
      assert.equal(focusedKey, "");

      const enterEvent = {
        key: "Enter",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(enterEvent as any);
      assert.equal(enterEvent.preventDefaultCalled, true);
      assert.equal(clicked.includes("click"), true);

      const downEvent = {
        key: "ArrowDown",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(downEvent as any);
      assert.equal(downEvent.preventDefaultCalled, true);
      assert.equal(listCells[2].focused, true);

      const rightEvent = {
        key: "ArrowRight",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(rightEvent as any);
      assert.equal(rightEvent.preventDefaultCalled, true);
      assert.equal(listCells[1].focused, true);

      const endEvent = {
        key: "End",
        preventDefault() {},
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(endEvent as any);
      assert.equal(listCells[2].focused, true);

      const homeEvent = {
        key: "Home",
        preventDefault() {},
        target: listCells[2],
      };
      interaction.onEmojiKeyDown(homeEvent as any);
      assert.equal(listCells[0].focused, true);

      const upEvent = {
        key: "ArrowUp",
        preventDefault() {},
        target: listCells[2],
      };
      interaction.onEmojiKeyDown(upEvent as any);
      assert.equal(listCells[0].focused, true);

      (globalThis as any).document.documentElement.dir = "rtl";
      const rtlEvent = {
        key: "ArrowLeft",
        preventDefault() {},
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(rtlEvent as any);
      assert.equal(listCells[1].focused, true);

      const ignoredEvent = {
        key: "Escape",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: listCells[0],
      };
      interaction.onEmojiKeyDown(ignoredEvent as any);
      assert.equal(ignoredEvent.preventDefaultCalled, false);
    } finally {
      runtime.restore();
    }
  });
});
