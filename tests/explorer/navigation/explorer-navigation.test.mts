import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Direct source under test: ../../../src/explorer/navigation/explorer-navigation.js

const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer/navigation/explorer-navigation.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { buildExplorerUrlQuery, parseExplorerUrlState, } from "./url-state.js";',
    'import { buildExplorerUrlQuery, parseExplorerUrlState, urlStateCalls } from "./url-state-stub.mjs";',
  )
  .replace(
    'import { applyBasicUrlStateToControls, applyExclusiveCheckboxSelection, applyLoadedUrlStateToControls, resetFilterControls, stepVersionIndex, } from "../filters/filter-controls.js";',
    'import { applyBasicUrlStateToControls, applyExclusiveCheckboxSelection, applyLoadedUrlStateToControls, resetFilterControls, stepVersionIndex, filterControlCalls } from "./filter-controls-stub.mjs";',
  )
  .replace(
    'import { closePanelDialog, getOpenPanel, getPanelDialog, openPanelDialog, } from "../pwa-panels.js";',
    'import { closePanelDialog, getOpenPanel, getPanelDialog, openPanelDialog, panelCalls } from "./pwa-panels-stub.mjs";',
  )
  .replace(
    'import { applyLanguagePanelParent, } from "./panel-parent.js";',
    'import { applyLanguagePanelParent } from "./panel-parent-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "explorer-navigation-"));

await fs.writeFile(
  path.join(tempDirectory, "url-state-stub.mjs"),
  `export const urlStateCalls = [];
let currentState = {
  compositionMode: "full",
  developerMode: true,
  emoji: undefined,
  emojiMode: "details",
  orderMode: "sequence",
  panel: "help",
  selectedSequenceType: "zwj",
};
export function setCurrentState(value) {
  currentState = value;
}
export function parseExplorerUrlState(options) {
  urlStateCalls.push(["parseExplorerUrlState", options]);
  return currentState;
}
export function buildExplorerUrlQuery(options) {
  urlStateCalls.push(["buildExplorerUrlQuery", options]);
  return "built=query";
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "filter-controls-stub.mjs"),
  `export const filterControlCalls = [];
export function applyBasicUrlStateToControls(options) {
  filterControlCalls.push(["applyBasicUrlStateToControls", options]);
  return {
    compositionMode: "condensed",
    orderMode: "popular",
    selectedSequenceType: "modifier",
  };
}
export function applyExclusiveCheckboxSelection(list, current) {
  filterControlCalls.push(["applyExclusiveCheckboxSelection", list, current]);
}
export function applyLoadedUrlStateToControls(options) {
  filterControlCalls.push(["applyLoadedUrlStateToControls", options]);
  return {
    selectedGroup: "Objects",
    selectedSubGroup: "Objects::mail",
  };
}
export function resetFilterControls(options) {
  filterControlCalls.push(["resetFilterControls", options]);
}
export function stepVersionIndex(current, length, amount) {
  filterControlCalls.push(["stepVersionIndex", current, length, amount]);
  return current + amount;
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "pwa-panels-stub.mjs"),
  `export const panelCalls = [];
export function closePanelDialog(dialog, suppressed) {
  panelCalls.push(["closePanelDialog", dialog, suppressed]);
}
export function getOpenPanel(dialogs) {
  panelCalls.push(["getOpenPanel", dialogs]);
  return "favorites";
}
export function getPanelDialog(panel, dialogs) {
  panelCalls.push(["getPanelDialog", panel, dialogs]);
  return dialogs[panel];
}
export function openPanelDialog(options) {
  panelCalls.push(["openPanelDialog", options]);
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "panel-parent-stub.mjs"),
  `export function applyLanguagePanelParent(dialogs, panel, panelParent) {
  if (!dialogs.language?.dataset) return;
  if (panel === "language" && panelParent) {
    dialogs.language.dataset.returnPanel = panelParent;
    return;
  }
  delete dialogs.language.dataset.returnPanel;
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-navigation.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-navigation.mjs")).href
);
const urlStateStub = await import(
  pathToFileURL(path.join(tempDirectory, "url-state-stub.mjs")).href
);
const filterStub = await import(
  pathToFileURL(path.join(tempDirectory, "filter-controls-stub.mjs")).href
);
const panelStub = await import(
  pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href
);

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalEvent = Object.getOwnPropertyDescriptor(globalThis, "Event");

try {
  const historyCalls: Array<[string, unknown, string]> = [];
  const searchInput = {
    focused: false,
    value: "smile",
    focus() {
      this.focused = true;
    },
  };
  const versionRange = {
    dispatched: [] as any[],
    value: "1",
    dispatchEvent(event: any) {
      this.dispatched.push(event);
    },
  };
  const versionSelector = {
    options: { length: 5 },
    value: "16.0",
  };
  const versionModeSelector = { value: "selected" };
  const dialog = {
    open: false,
    classList: {
      contains(name: string) {
        return name === "is-code-view";
      },
    },
  };
  const dialogs = {
    favorites: { open: false, id: "favorites" },
    filters: { open: false, id: "filters" },
    help: { open: false, id: "help" },
    language: { open: true, id: "language" },
  };
  const selectedValues: Array<[string, string]> = [];
  let compositionMode = "details";
  const drawCalls: string[] = [];
  const navigationCalls: number[] = [];
  const openEmojiCalls: any[] = [];

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: {
        state: { page: 1 },
        pushState(state: unknown, _title: string, url: string) {
          historyCalls.push(["push", state, url]);
        },
        replaceState(state: unknown, _title: string, url: string) {
          historyCalls.push(["replace", state, url]);
        },
      },
      location: {
        hash: "#top",
        pathname: "/index.en.html",
        search: "?existing=1",
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      activeElement: { tagName: "DIV" },
      documentElement: { dir: "rtl" },
      querySelector(selector: string) {
        return selector === "dialog[open]" ? null : null;
      },
    },
  });
  Object.defineProperty(globalThis, "Event", {
    configurable: true,
    value: class FakeEvent {
      constructor(
        readonly type: string,
        readonly options: Record<string, unknown>,
      ) {}
    },
  });

  const navigation = module.createExplorerNavigation({
    allowedSequenceTypes: ["zwj"],
    applyingUrlState: () => false,
    closeEmojiDialog() {
      drawCalls.push("closeEmojiDialog");
    },
    compositionMode: () => compositionMode as "condensed" | "full",
    currentEmojiKey: () => "sparkles",
    developerModeEnabled: () => true,
    fullDeveloperModeEnabled: () => false,
    dialog: () => dialog as any,
    drawList() {
      drawCalls.push("drawList");
    },
    emojiByKey: () => ({ sparkles: "✨" }),
    genderCheckboxes: () => [{ checked: true, value: "neutral" }],
    getOrderMode: () => "sequence",
    getSelectedGroup: () => "Objects",
    getSelectedSequenceType: () => "zwj",
    getSelectedSubGroup: () => "Objects::mail",
    groups: () => ["Objects"],
    hairCheckboxes: () => [{ checked: false, value: "redHair" }],
    helpDialog: () => dialogs.help as any,
    languageList: () => ({ id: "language-list" } as any),
    latestReleasedVersion: () => "17.0",
    navigateEmoji(amount: number) {
      navigationCalls.push(amount);
    },
    openEmoji(...args: any[]) {
      openEmojiCalls.push(args);
    },
    orderButtons: () => [{ id: "unicode" }],
    panelDialogs: () => dialogs,
    preferredOrder: () => "unicode",
    renderCategoryFilters() {
      drawCalls.push("renderCategoryFilters");
    },
    renderSavedEmoji() {
      drawCalls.push("renderSavedEmoji");
    },
    renderVersionModeToggle() {
      drawCalls.push("renderVersionModeToggle");
    },
    searchText: () => searchInput as any,
    setCompositionMode(mode: "condensed" | "full") {
      compositionMode = mode;
      selectedValues.push(["compositionMode", mode]);
    },
    setDialogView() {},
    setOrderMode(value: "grouped" | "popular" | "unicode" | "sequence") {
      selectedValues.push(["orderMode", value]);
    },
    setSelectedGroup(value: string) {
      selectedValues.push(["group", value]);
    },
    setSelectedSequenceType(value: string) {
      selectedValues.push(["sequenceType", value]);
    },
    setSelectedSubGroup(value: string) {
      selectedValues.push(["subGroup", value]);
    },
    showEmojiDialog() {
      drawCalls.push("showEmojiDialog");
    },
    skinToneCheckboxes: () => [{ checked: true, value: "1F3FB" }],
    subGroupSelectionKey: (group: string, subGroup: string) =>
      `${group}::${subGroup}`,
    subGroups: () => ({ Objects: ["mail"] }),
    suppressedPanelCloses: () => new WeakSet(),
    syncVersionRange() {
      drawCalls.push("syncVersionRange");
    },
    urlStateReady: () => true,
    versionModeSelector: () => versionModeSelector as any,
    versionRange: () => versionRange as any,
    versionSelector: () => versionSelector as any,
  });

  navigation.applyBasicUrlState();
  assert.deepEqual(selectedValues.slice(0, 3), [
    ["orderMode", "popular"],
    ["sequenceType", "modifier"],
    ["compositionMode", "condensed"],
  ]);

  navigation.applyLoadedUrlState();
  assert.deepEqual(selectedValues.slice(3, 5), [
    ["group", "Objects"],
    ["subGroup", "Objects::mail"],
  ]);
  assert.equal(drawCalls.includes("renderVersionModeToggle"), true);
  assert.equal(drawCalls.includes("syncVersionRange"), true);

  urlStateStub.setCurrentState({
    compositionMode: "full",
    emoji: "sparkles",
    emojiMode: "code",
    panel: "help",
  });
  navigation.applyDialogUrlState();
  assert.equal(openEmojiCalls.length, 1);
  assert.equal(drawCalls.includes("showEmojiDialog"), true);

  dialog.open = true;
  urlStateStub.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "language",
  });
  navigation.applyDialogUrlState();
  assert.equal(drawCalls.includes("closeEmojiDialog"), true);
  assert.equal(
    panelStub.panelCalls.some((call: any[]) => call[0] === "openPanelDialog"),
    false,
  );

  urlStateStub.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "",
  });
  navigation.applyDialogUrlState();
  assert.equal(
    drawCalls.filter((entry) => entry === "closeEmojiDialog").length >= 1,
    true,
  );

  dialogs.help.open = false;
  urlStateStub.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "help",
  });
  navigation.applyDialogUrlState();
  assert.equal(
    panelStub.panelCalls.some(
      (call: any[]) => call[0] === "openPanelDialog" && call[1]?.panel === "help",
    ),
    true,
  );

  navigation.syncUrlState("push");
  assert.deepEqual(historyCalls[0], ["push", { page: 1 }, "/index.en.html?built=query#top"]);

  navigation.resetFilters();
  assert.equal(searchInput.value, "smile");
  assert.equal(drawCalls.includes("renderCategoryFilters"), true);
  assert.equal(searchInput.focused, true);

  navigation.onGenderChange({ currentTarget: { value: "neutral" } });
  navigation.onSkinToneChange({ currentTarget: { value: "1F3FB" } });
  navigation.onHairChange({ currentTarget: { value: "redHair" } });
  assert.equal(
    filterStub.filterControlCalls.filter((call: any[]) => call[0] === "applyExclusiveCheckboxSelection").length,
    3,
  );

  navigation.stepVersion(2);
  assert.equal(versionRange.value, "3");
  assert.equal(versionRange.dispatched[0]?.type, "input");

  const helpEvent = {
    key: "?",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(helpEvent as any);
  assert.equal(helpEvent.preventDefaultCalled, true);

  const slashEvent = {
    key: "/",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(slashEvent as any);
  assert.equal(slashEvent.preventDefaultCalled, true);

  const escapeEvent = { key: "Escape" };
  navigation.onDocumentKeyDown(escapeEvent as any);
  assert.equal(searchInput.value, "");

  dialog.open = true;
  (globalThis.document as any).querySelector = (selector: string) =>
    selector === "dialog[open]" ? { open: true } : null;
  const arrowEvent = {
    key: "ArrowLeft",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(arrowEvent as any);
  assert.equal(arrowEvent.preventDefaultCalled, true);
  assert.deepEqual(navigationCalls, [1]);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalEvent) Object.defineProperty(globalThis, "Event", originalEvent);
  else Reflect.deleteProperty(globalThis, "Event");
}
