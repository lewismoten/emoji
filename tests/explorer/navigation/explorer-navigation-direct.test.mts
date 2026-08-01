import assert from "node:assert/strict";
import {
  createExplorerNavigation,
  createExplorerNavigationDependencies,
} from "../../../src/explorer/navigation/explorer-navigation.js";
import {
  createExplorerNavigationDirectFixture,
  installExplorerNavigationGlobals,
} from "./explorer-navigation-direct-fixture.mjs";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalEvent = Object.getOwnPropertyDescriptor(globalThis, "Event");
const asAny = (value: unknown) => value as any;

try {
  const defaults = createExplorerNavigationDependencies();
  assert.equal(typeof defaults.parseExplorerUrlState, "function");
  assert.equal(typeof defaults.buildExplorerUrlQuery, "function");
  assert.equal(typeof defaults.openPanelDialog, "function");
  const fixture = createExplorerNavigationDirectFixture();

  const defaultNavigation = createExplorerNavigation({
    allowedSequenceTypes: [],
    applyingUrlState: () => true,
    closeEmojiDialog() {},
    compositionMode: () => "full",
    currentEmojiKey: () => "",
    developerModeEnabled: () => false,
    fullDeveloperModeEnabled: () => false,
    dialog: () => asAny({ open: false, classList: { contains: () => false } }),
    drawList() {},
    emojiByKey: () => ({}),
    genderCheckboxes: () => [],
    getOrderMode: () => "unicode",
    getSelectedGroup: () => "",
    getSelectedSequenceType: () => "",
    getSelectedSubGroup: () => "",
    groups: () => [],
    hairCheckboxes: () => [],
    helpDialog: () => undefined,
    languageList: () => undefined,
    latestReleasedVersion: () => undefined,
    navigateEmoji() {},
    openEmoji() {},
    orderButtons: () => [],
    panelDialogs: () => ({}),
    preferredOrder: () => "unicode",
    renderCategoryFilters() {},
    renderSavedEmoji() {},
    renderVersionModeToggle() {},
    searchText: () => asAny({ value: "", focus() {} }),
    setCompositionMode() {},
    setDialogView() {},
    setOrderMode() {},
    setSelectedGroup() {},
    setSelectedSequenceType() {},
    setSelectedSubGroup() {},
    showEmojiDialog() {},
    skinToneCheckboxes: () => [],
    subGroupSelectionKey: (group: string, subGroup: string) =>
      `${group}::${subGroup}`,
    subGroups: () => ({}),
    suppressedPanelCloses: () => new WeakSet(),
    syncVersionRange() {},
    urlStateReady: () => false,
    versionModeSelector: () => asAny({ value: "through" }),
    versionRange: () => asAny({ value: "0", dispatchEvent() {} }),
    versionSelector: () => asAny({ value: "", options: { length: 0 } }),
  });
  assert.equal(typeof defaultNavigation.syncUrlState, "function");
  installExplorerNavigationGlobals(fixture);

  const navigation = createExplorerNavigation(
    {
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
    },
    {
      parseExplorerUrlState(options: unknown) {
        fixture.urlStateCalls.push(["parseExplorerUrlState", options]);
        return fixture.currentState();
      },
      buildExplorerUrlQuery(options: unknown) {
        fixture.urlStateCalls.push(["buildExplorerUrlQuery", options]);
        return "built=query";
      },
      applyBasicUrlStateToControls(options: unknown) {
        fixture.filterCalls.push(["applyBasicUrlStateToControls", options]);
        return {
          compositionMode: "condensed",
          orderMode: "popular",
          selectedSequenceType: "modifier",
        };
      },
      applyExclusiveCheckboxSelection(list: unknown, current: unknown) {
        fixture.filterCalls.push(["applyExclusiveCheckboxSelection", list, current]);
      },
      applyLoadedUrlStateToControls(options: unknown) {
        fixture.filterCalls.push(["applyLoadedUrlStateToControls", options]);
        return {
          selectedGroup: "Objects",
          selectedSubGroup: "Objects::mail",
        };
      },
      resetFilterControls(options: unknown) {
        fixture.filterCalls.push(["resetFilterControls", options]);
      },
      stepVersionIndex(current: number, _length: number, amount: number) {
        fixture.filterCalls.push(["stepVersionIndex", current, _length, amount]);
        return current + amount;
      },
      closePanelDialog(dialogRef: unknown, suppressed: unknown) {
        fixture.panelCalls.push(["closePanelDialog", dialogRef, suppressed]);
      },
      ensurePanelDialogLifecycleBound(options: unknown) {
        fixture.panelCalls.push([
          "ensurePanelDialogLifecycleBound",
          options,
        ]);
      },
      getOpenPanel(dialogsRef: unknown) {
        fixture.panelCalls.push(["getOpenPanel", dialogsRef]);
        return "favorites";
      },
      getPanelDialog(panel: unknown, dialogsRef: any) {
        fixture.panelCalls.push(["getPanelDialog", panel, dialogsRef]);
        return dialogsRef[panel as keyof typeof dialogsRef];
      },
      openPanelDialog(options: unknown) {
        fixture.panelCalls.push(["openPanelDialog", options]);
      },
    },
  );

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

  fixture.setCurrentState({
    compositionMode: "full",
    emoji: "sparkles",
    emojiMode: "code",
    panel: "help",
  });
  navigation.applyDialogUrlState();
  assert.equal(fixture.openEmojiCalls.length, 1);
  assert.equal(fixture.drawCalls.includes("showEmojiDialog"), true);

  fixture.dialog.open = true;
  fixture.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "language",
  });
  navigation.applyDialogUrlState();
  assert.equal(fixture.drawCalls.includes("closeEmojiDialog"), true);
  assert.equal(
    fixture.panelCalls.some((call: any[]) => call[0] === "openPanelDialog"),
    false,
  );

  fixture.dialogs.help.open = false;
  fixture.setCurrentState({
    compositionMode: "condensed",
    emoji: undefined,
    panel: "help",
  });
  navigation.applyDialogUrlState();
  assert.equal(
    fixture.panelCalls.some(
      (call: any[]) => call[0] === "openPanelDialog" && call[1]?.panel === "help",
    ),
    true,
  );

  navigation.syncUrlState("push");
  assert.deepEqual(fixture.historyCalls[0], [
    "push",
    { page: 1 },
    "/index.en.html?built=query#top",
  ]);

  Reflect.deleteProperty(globalThis, "window");
  navigation.applyLoadedUrlState();
  navigation.syncUrlState("replace");
  assert.equal(
    fixture.urlStateCalls.some(
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
    fixture.filterCalls.filter(
      (call: any[]) => call[0] === "applyExclusiveCheckboxSelection",
    ).length,
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

  const typingEvent = {
    key: "?",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  (globalThis.document as any).activeElement = { tagName: "INPUT" };
  navigation.onDocumentKeyDown(asAny(typingEvent));
  assert.equal(typingEvent.preventDefaultCalled, false);
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
  if (originalEvent) {
    Object.defineProperty(globalThis, "Event", originalEvent);
  } else {
    Reflect.deleteProperty(globalThis, "Event");
  }
}
