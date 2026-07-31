import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Pairing source: ../../../src/explorer/emoji/list-controller.js
// Direct source under test: ../../../../build/src/explorer/emoji/list-controller.js

const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer/emoji/list-controller.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source.replace(
  'import { filterEmojiKeys } from "./emoji-filter.js";',
  'import { filterEmojiKeys, filterCalls } from "./emoji-filter-stub.mjs";',
);

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "list-controller-"));

await fs.writeFile(
  path.join(tempDirectory, "emoji-filter-stub.mjs"),
  `export const filterCalls = [];
export function filterEmojiKeys(options) {
  filterCalls.push(options);
  return ["beta", "alpha"];
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "list-controller.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "list-controller.mjs")).href
);
const filterStub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-filter-stub.mjs")).href
);

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
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      activeElement: {
        closest(selector: string) {
          return selector === "[data-emoji-key]" ? { id: "active" } : null;
        },
      },
    },
  });

  const searchInput = {
    focused: false,
    value: "smile",
    focus() {
      this.focused = true;
    },
  };
  const displayedKeys: string[][] = [];
  const focusedKeys: string[] = [];
  const renderCalls: Array<[string[], boolean]> = [];
  const matchCount = { innerText: "" };
  let focusedEmojiKey = "";
  const controller = module.createListController({
    allIds: () => ["alpha", "beta", "gamma"],
    byId: () => ({ alpha: {}, beta: {} }),
    emojiByKey: () => ({ alpha: "😀", beta: "😎" }),
    formatNumber: (value: number) => `#${value}`,
    genderCheckboxes: () => [{ checked: true, value: "neutral" }],
    getVersionKeys: () => ["alpha", "beta"],
    hairCheckboxes: () => [{ checked: false, value: "1F9B0" }],
    items: () => [{ key: "row" }],
    nextRenderGeneration: () => 1,
    focusedEmojiKey: () => focusedEmojiKey,
    matchCount: () => matchCount,
    orderedKeys: (keys: string[]) => [...keys].reverse(),
    orderMode: () => "unicode",
    popularKeys: () => ["beta", "alpha"],
    renderEmojiList(keys: string[], restore: boolean) {
      renderCalls.push([keys, restore]);
    },
    searchAnnotations: () => ({ alpha: ["grinning"] }),
    searchText: () => searchInput as any,
    selectedGroup: () => "Objects",
    selectedGenders: () => ["neutral"],
    selectedSearchLocale: () => "en",
    selectedSequenceType: () => "single",
    selectedSubGroup: () => "Objects::mail",
    setDisplayedKeys(keys: string[]) {
      displayedKeys.push(keys);
    },
    setFocusedEmojiKey(key: string) {
      focusedEmojiKey = key;
      focusedKeys.push(key);
    },
    skinToneCheckboxes: () => [{ checked: true, value: "1F3FB" }],
    subGroupSelectionKey: (group: string, subGroup: string) =>
      `${group}:${subGroup}`,
    syncUrlState() {
      focusedKeys.push("sync");
    },
    updateDialogNavigation() {
      focusedKeys.push("dialog");
    },
    updateFilterSummary() {
      focusedKeys.push("summary");
    },
  });

  controller.draw();
  assert.equal(filterStub.filterCalls.length, 1);
  assert.deepEqual(displayedKeys[0], ["alpha", "beta"]);
  assert.deepEqual(renderCalls[0], [["alpha", "beta"], true]);
  assert.equal(matchCount.innerText, "#2");
  assert.equal(focusedEmojiKey, "alpha");
  assert.equal(filterStub.filterCalls[0].selectedGroup, "Objects");
  assert.equal(filterStub.filterCalls[0].selectedSubGroup, "Objects::mail");

  focusedEmojiKey = "beta";
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      activeElement: {
        closest() {
          return null;
        },
      },
    },
  });
  controller.draw();
  assert.deepEqual(renderCalls.at(-1), [["alpha", "beta"], false]);
  assert.equal(focusedEmojiKey, "beta");

  controller.schedule();
  controller.schedule();
  assert.deepEqual(cleared, [1]);
  controller.draw();
  assert.deepEqual(cleared, [1, 2]);
  controller.schedule();
  timers.get(3)?.();
  assert.equal(filterStub.filterCalls.length, 4);

  searchInput.value = "";
  controller.draw();
  assert.equal(renderCalls.at(-1)?.[1], false);
  assert.equal(searchInput.focused, false);

  const emptyFilterCalls: any[] = [];
  await fs.writeFile(
    path.join(tempDirectory, "emoji-filter-empty-stub.mjs"),
    `export const filterCalls = [];
export function filterEmojiKeys(options) {
  filterCalls.push(options);
  return [];
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "list-controller-empty.mjs"),
    transformedSource.replace(
      './emoji-filter-stub.mjs',
      './emoji-filter-empty-stub.mjs',
    ),
  );
  const emptyModule = await import(
    pathToFileURL(path.join(tempDirectory, "list-controller-empty.mjs")).href
  );
  const emptyFilterStub = await import(
    pathToFileURL(path.join(tempDirectory, "emoji-filter-empty-stub.mjs")).href
  );
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { activeElement: null },
  });
  const emptyMatchCount = { innerText: "" };
  const emptyRenderCalls: Array<[string[], boolean]> = [];
  const emptyFocusedKeys: string[] = [];
  const emptyController = emptyModule.createListController({
    allIds: () => [],
    byId: () => ({}),
    emojiByKey: () => ({}),
    formatNumber: (value: number) => `${value}`,
    genderCheckboxes: () => [],
    getVersionKeys: () => [],
    hairCheckboxes: () => [],
    items: () => [],
    nextRenderGeneration: () => 0,
    focusedEmojiKey: () => "",
    matchCount: () => emptyMatchCount,
    orderedKeys: (keys: string[]) => keys,
    orderMode: () => "unicode",
    popularKeys: () => [],
    renderEmojiList(keys: string[], restore: boolean) {
      emptyRenderCalls.push([keys, restore]);
    },
    searchAnnotations: () => ({}),
    searchText: () => ({ value: "" }) as any,
    selectedGroup: () => "Objects",
    selectedSearchLocale: () => "",
    selectedSequenceType: () => "",
    selectedSubGroup: () => "mail",
    setDisplayedKeys(_keys: string[]) {},
    setFocusedEmojiKey(key: string) {
      emptyFocusedKeys.push(key);
    },
    skinToneCheckboxes: () => [],
    subGroupSelectionKey: (_group: string, _subGroup: string) => "",
    syncUrlState() {},
    updateDialogNavigation() {},
    updateFilterSummary() {},
  });
  emptyController.draw();
  assert.equal(emptyFilterStub.filterCalls[0].selectedGroup, "");
  assert.equal(emptyFilterStub.filterCalls[0].selectedSubGroup, "");
  assert.deepEqual(emptyFocusedKeys, [""]);
  assert.deepEqual(emptyRenderCalls[0], [[], false]);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
