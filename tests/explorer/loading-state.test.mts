import assert from "node:assert/strict";
import {
  finishExplorerLoading,
  revealExplorer,
} from "../../src/explorer/loading-state.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

const createClassList = () => {
  const values = new Set<string>();
  return {
    values,
    add(name: string) {
      values.add(name);
    },
    remove(name: string) {
      values.delete(name);
    },
    has(name: string) {
      return values.has(name);
    },
  };
};

try {
  const rootClassList = createClassList();
  rootClassList.add("app-loading");
  const comparison: any = { textContent: "" };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { classList: rootClassList },
      querySelector(selector: string) {
        assert.equal(selector, ".pixel-comparison-custom");
        return comparison;
      },
    },
  });

  const resultCountContainer = { hidden: true };
  const emojiListClassList = createClassList();
  emojiListClassList.add("is-loading");
  const emojiList = {
    dataset: { rendering: "false" },
    classList: emojiListClassList,
    attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
  };
  const matchCount = {
    closest(selector: string) {
      assert.equal(selector, ".result-count");
      return resultCountContainer;
    },
  };
  const applyCalls: unknown[][] = [];
  let revealCalls = 0;

  finishExplorerLoading({
    applyPixelArtworkClass(element, emojiKey) {
      applyCalls.push([element, emojiKey]);
    },
    emojiByKey: { grinningFace: "😀" },
    emojiList: emojiList as any,
    matchCount: matchCount as any,
    revealExplorer() {
      revealCalls += 1;
    },
  });
  assert.equal(revealCalls, 1);
  assert.equal(resultCountContainer.hidden, false);
  assert.equal(comparison.textContent, "😀");
  assert.deepEqual(applyCalls, [[comparison, "grinningFace"]]);

  emojiList.dataset.rendering = "true";
  comparison.textContent = "";
  finishExplorerLoading({
    applyPixelArtworkClass(element, emojiKey) {
      applyCalls.push([element, emojiKey]);
    },
    emojiByKey: {},
    emojiList: emojiList as any,
    matchCount: matchCount as any,
    revealExplorer() {
      revealCalls += 1;
    },
  });
  assert.equal(revealCalls, 1);
  assert.equal(comparison.textContent, "😀");

  revealExplorer(emojiList as any, matchCount as any);
  assert.equal(rootClassList.has("app-loading"), false);
  assert.equal(emojiListClassList.has("is-loading"), false);
  assert.equal(emojiList.attributes.get("aria-busy"), "false");
  assert.equal(resultCountContainer.hidden, false);
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
