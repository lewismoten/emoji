import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createExplorerNavigationDirectFixture,
  installExplorerNavigationGlobals,
} from "./explorer-navigation-direct-fixture.mjs";
// Pairing source: ../../../src/explorer/navigation/explorer-navigation.js | Direct source under test: ../../../build/src/explorer/navigation/explorer-navigation.js

const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer/navigation/explorer-navigation.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { buildExplorerUrlQuery, parseExplorerUrlState } from "./url-state.js";',
    'import { buildExplorerUrlQuery, parseExplorerUrlState, urlStateCalls } from "./url-state-stub.mjs";',
  )
  .replace(
    'import { applyBasicUrlStateToControls, applyExclusiveCheckboxSelection, applyLoadedUrlStateToControls, resetFilterControls, stepVersionIndex, } from "../filters/filter-controls.js";',
    'import { applyBasicUrlStateToControls, applyExclusiveCheckboxSelection, applyLoadedUrlStateToControls, resetFilterControls, stepVersionIndex, filterControlCalls } from "./filter-controls-stub.mjs";',
  )
  .replace(
    /import\s*\{\s*closePanelDialog,\s*ensurePanelDialogLifecycleBound,\s*getOpenPanel,\s*getPanelDialog,\s*openPanelDialog,\s*\}\s*from\s*"\.\.\/pwa-panels\.js";/,
    'import { closePanelDialog, ensurePanelDialogLifecycleBound, getOpenPanel, getPanelDialog, openPanelDialog, panelCalls } from "./pwa-panels-stub.mjs";',
  )
  .replace(
    'import { applyLanguagePanelParent } from "./panel-parent.js";',
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
export function ensurePanelDialogLifecycleBound(options) {
  panelCalls.push(["ensurePanelDialogLifecycleBound", options]);
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
const asAny = (value: unknown) => value as any;

try {
  const defaults = module.createExplorerNavigationDependencies();
  assert.equal(typeof defaults.getPanelDialog, "function");
  assert.equal(typeof defaults.openPanelDialog, "function");
  const fixture = createExplorerNavigationDirectFixture();
  installExplorerNavigationGlobals(fixture);

  const navigation = module.createExplorerNavigation({
    allowedSequenceTypes: ["zwj"],
    applyingUrlState: () => false,
    closeEmojiDialog() {
      fixture.drawCalls.push("closeEmojiDialog");
    },
    compositionMode: () => fixture.compositionMode() as "condensed" | "full",
    currentEmojiKey: () => "sparkles",
    developerModeEnabled: () => true,
    fullDeveloperModeEnabled: () => false,
    dialog: () => asAny(fixture.dialog),
    drawList() {
      fixture.drawCalls.push("drawList");
    },
    emojiByKey: () => ({ sparkles: "✨" }),
    genderCheckboxes: () => [{ checked: true, value: "neutral" }],
    getOrderMode: () => "sequence",
    getSelectedGroup: () => "Objects",
    getSelectedSequenceType: () => "zwj",
    getSelectedSubGroup: () => "Objects::mail",
    groups: () => ["Objects"],
    hairCheckboxes: () => [{ checked: false, value: "redHair" }],
    helpDialog: () => asAny(fixture.dialogs.help),
    languageList: () => asAny({ id: "language-list" }),
    latestReleasedVersion: () => "17.0",
    navigateEmoji(amount: number) {
      fixture.navigationCalls.push(amount);
    },
    openEmoji(...args: any[]) {
      fixture.openEmojiCalls.push(args);
    },
    orderButtons: () => [{ id: "unicode" }],
    panelDialogs: () => fixture.dialogs,
    preferredOrder: () => "unicode",
    renderCategoryFilters() {
      fixture.drawCalls.push("renderCategoryFilters");
    },
    renderSavedEmoji() {
      fixture.drawCalls.push("renderSavedEmoji");
    },
    renderVersionModeToggle() {
      fixture.drawCalls.push("renderVersionModeToggle");
    },
    searchText: () => asAny(fixture.searchInput),
    setCompositionMode(mode: "condensed" | "full") {
      fixture.setCompositionMode(mode);
      fixture.selectedValues.push(["compositionMode", mode]);
    },
    setDialogView() {},
    setOrderMode(value: "grouped" | "popular" | "unicode" | "sequence") {
      fixture.selectedValues.push(["orderMode", value]);
    },
    setSelectedGroup(value: string) {
      fixture.selectedValues.push(["group", value]);
    },
    setSelectedSequenceType(value: string) {
      fixture.selectedValues.push(["sequenceType", value]);
    },
    setSelectedSubGroup(value: string) {
      fixture.selectedValues.push(["subGroup", value]);
    },
    showEmojiDialog() {
      fixture.drawCalls.push("showEmojiDialog");
    },
    skinToneCheckboxes: () => [{ checked: true, value: "1F3FB" }],
    subGroupSelectionKey: (group: string, subGroup: string) =>
      `${group}::${subGroup}`,
    subGroups: () => ({ Objects: ["mail"] }),
    suppressedPanelCloses: () => new WeakSet(),
    syncVersionRange() {
      fixture.drawCalls.push("syncVersionRange");
    },
    urlStateReady: () => true,
    versionModeSelector: () => asAny(fixture.versionModeSelector),
    versionRange: () => asAny(fixture.versionRange),
    versionSelector: () => asAny(fixture.versionSelector),
  });

  navigation.applyBasicUrlState();
  assert.deepEqual(fixture.selectedValues.slice(0, 3), [
    ["orderMode", "popular"],
    ["sequenceType", "modifier"],
    ["compositionMode", "condensed"],
  ]);

  navigation.applyLoadedUrlState();
  assert.deepEqual(fixture.selectedValues.slice(3, 5), [
    ["group", "Objects"],
    ["subGroup", "Objects::mail"],
  ]);
  assert.equal(fixture.drawCalls.includes("renderVersionModeToggle"), true);
  assert.equal(fixture.drawCalls.includes("syncVersionRange"), true);

  urlStateStub.setCurrentState({
    compositionMode: "full",
    emoji: "sparkles",
    emojiMode: "code",
    panel: "help",
  });
  navigation.applyDialogUrlState();
  assert.equal(fixture.openEmojiCalls.length, 1);
  assert.equal(fixture.drawCalls.includes("showEmojiDialog"), true);

  fixture.dialog.open = true;
  urlStateStub.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "language",
  });
  navigation.applyDialogUrlState();
  assert.equal(fixture.drawCalls.includes("closeEmojiDialog"), true);
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
    fixture.drawCalls.filter((entry) => entry === "closeEmojiDialog").length >=
      1,
    true,
  );

  fixture.dialogs.help.open = false;
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
  assert.deepEqual(fixture.historyCalls[0], ["push", { page: 1 }, "/index.en.html?built=query#top"]);

  Reflect.deleteProperty(globalThis, "window");
  navigation.applyLoadedUrlState();
  navigation.syncUrlState("replace");
  assert.equal(
    urlStateStub.urlStateCalls.some(
      (call: any[]) =>
        call[0] === "parseExplorerUrlState" && call[1]?.search === "",
    ),
    true,
  );

  navigation.resetFilters();
  assert.equal(fixture.searchInput.value, "smile");
  assert.equal(fixture.drawCalls.includes("renderCategoryFilters"), true);
  assert.equal(fixture.searchInput.focused, true);

  navigation.onGenderChange(asAny({ currentTarget: { value: "neutral" } }));
  navigation.onSkinToneChange(asAny({ currentTarget: { value: "1F3FB" } }));
  navigation.onHairChange(asAny({ currentTarget: { value: "redHair" } }));
  assert.equal(
    filterStub.filterControlCalls.filter((call: any[]) => call[0] === "applyExclusiveCheckboxSelection").length,
    3,
  );

  navigation.stepVersion(2);
  assert.equal(fixture.versionRange.value, "3");
  assert.equal(fixture.versionRange.dispatched[0]?.type, "input");

  const helpEvent = {
    key: "?",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(asAny(helpEvent));
  assert.equal(helpEvent.preventDefaultCalled, true);

  const slashEvent = {
    key: "/",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(asAny(slashEvent));
  assert.equal(slashEvent.preventDefaultCalled, true);

  const escapeEvent = { key: "Escape" };
  navigation.onDocumentKeyDown(asAny(escapeEvent));
  assert.equal(fixture.searchInput.value, "");

  fixture.dialog.open = true;
  (globalThis.document as any).querySelector = (selector: string) =>
    selector === "dialog[open]" ? { open: true } : null;
  const arrowEvent = {
    key: "ArrowLeft",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  navigation.onDocumentKeyDown(asAny(arrowEvent));
  assert.equal(arrowEvent.preventDefaultCalled, true);
  assert.deepEqual(fixture.navigationCalls, [1]);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalEvent) Object.defineProperty(globalThis, "Event", originalEvent);
  else Reflect.deleteProperty(globalThis, "Event");
}
