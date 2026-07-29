import assert from "node:assert/strict";
import { createEmojiListInteraction } from "../../src/explorer/emoji-list-interaction.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalPerformance = Object.getOwnPropertyDescriptor(
  globalThis,
  "performance",
);

class FakeNode {
  childNodes: any[] = [];
  constructor(readonly text?: string) {}

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }
}

class FakeElement {
  className = "";
  textContent = "";
  type = "";
  hidden = false;
  id = "";
  tabIndex = -1;
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  listeners = new Map<string, () => void>();
  childNodes: any[] = [];
  focused = false;
  rect = { left: 0, top: 0, width: 10, height: 10 };

  constructor(readonly tagName: string) {}

  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  }

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  closest(selector: string) {
    return selector === "[data-emoji-key]" ? this : null;
  }

  focus() {
    this.focused = true;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  replaceChildren(...nodes: any[]) {
    this.childNodes = nodes;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

try {
  const timers: Array<() => void> = [];
  let yielded = 0;
  const focusedById = new Map<string, FakeElement>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      scheduler: {
        yield() {
          yielded += 1;
          return Promise.resolve();
        },
      },
      setTimeout(callback: () => void) {
        timers.push(callback);
        return timers.length;
      },
    },
  });
  Object.defineProperty(globalThis, "performance", {
    configurable: true,
    value: {
      now() {
        return 0;
      },
    },
  });

  const emojiList = new FakeElement("div");
  emojiList.dataset = {};
  const listCells = [new FakeElement("button"), new FakeElement("button"), new FakeElement("button")];
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

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createDocumentFragment() {
        return new FakeNode();
      },
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
      documentElement: { dir: "ltr" },
      getElementById(id: string) {
        return focusedById.get(id) ?? null;
      },
    },
  });

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
  assert.equal(yielded, 0);

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

  interaction.onEmojiFocus({
    target: listCells[2],
  } as any);
  assert.equal(focusedKey, "gamma");
  assert.deepEqual(listCells.map((cell) => cell.tabIndex), [-1, -1, 0]);

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

  const homeEvent = {
    key: "Home",
    preventDefault() {},
    target: listCells[2],
  };
  interaction.onEmojiKeyDown(homeEvent as any);
  assert.equal(listCells[0].focused, true);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalPerformance) Object.defineProperty(globalThis, "performance", originalPerformance);
  else Reflect.deleteProperty(globalThis, "performance");
}
