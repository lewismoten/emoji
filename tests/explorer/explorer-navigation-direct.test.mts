import assert from "node:assert/strict";

import {
  createExplorerNavigation,
  createExplorerNavigationDependencies,
} from "../../src/explorer/explorer-navigation.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalEvent = Object.getOwnPropertyDescriptor(globalThis, "Event");

try {
  const defaults = createExplorerNavigationDependencies();
  assert.equal(typeof defaults.parseExplorerUrlState, "function");
  assert.equal(typeof defaults.buildExplorerUrlQuery, "function");
  assert.equal(typeof defaults.openPanelDialog, "function");

  const defaultNavigation = createExplorerNavigation({
    allowedSequenceTypes: [],
    applyingUrlState: () => true,
    closeEmojiDialog() {},
    compositionMode: () => "full",
    currentEmojiKey: () => "",
    developerModeEnabled: () => false,
    dialog: () => ({ open: false, classList: { contains: () => false } }) as any,
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
    searchText: () => ({ value: "", focus() {} }) as any,
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
    versionModeSelector: () => ({ value: "through" }) as any,
    versionRange: () => ({ value: "0", dispatchEvent() {} }) as any,
    versionSelector: () => ({ value: "", options: { length: 0 } }) as any,
  });
  assert.equal(typeof defaultNavigation.syncUrlState, "function");

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
  const urlStateCalls: any[] = [];
  const filterCalls: any[] = [];
  const panelCalls: any[] = [];
  let currentState: any = {
    compositionMode: "full",
    developerMode: true,
    emoji: undefined,
    emojiMode: "details",
    orderMode: "sequence",
    panel: "help",
    selectedSequenceType: "zwj",
  };

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

  const navigation = createExplorerNavigation(
    {
      allowedSequenceTypes: ["zwj"],
      applyingUrlState: () => false,
      closeEmojiDialog() {
        drawCalls.push("closeEmojiDialog");
      },
      compositionMode: () => compositionMode as "condensed" | "full",
      currentEmojiKey: () => "sparkles",
      developerModeEnabled: () => true,
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
    },
    {
      parseExplorerUrlState(options: unknown) {
        urlStateCalls.push(["parseExplorerUrlState", options]);
        return currentState;
      },
      buildExplorerUrlQuery(options: unknown) {
        urlStateCalls.push(["buildExplorerUrlQuery", options]);
        return "built=query";
      },
      applyBasicUrlStateToControls(options: unknown) {
        filterCalls.push(["applyBasicUrlStateToControls", options]);
        return {
          compositionMode: "condensed",
          orderMode: "popular",
          selectedSequenceType: "modifier",
        };
      },
      applyExclusiveCheckboxSelection(list: unknown, current: unknown) {
        filterCalls.push(["applyExclusiveCheckboxSelection", list, current]);
      },
      applyLoadedUrlStateToControls(options: unknown) {
        filterCalls.push(["applyLoadedUrlStateToControls", options]);
        return {
          selectedGroup: "Objects",
          selectedSubGroup: "Objects::mail",
        };
      },
      resetFilterControls(options: unknown) {
        filterCalls.push(["resetFilterControls", options]);
      },
      stepVersionIndex(current: number, _length: number, amount: number) {
        filterCalls.push(["stepVersionIndex", current, _length, amount]);
        return current + amount;
      },
      closePanelDialog(dialogRef: unknown, suppressed: unknown) {
        panelCalls.push(["closePanelDialog", dialogRef, suppressed]);
      },
      getOpenPanel(dialogsRef: unknown) {
        panelCalls.push(["getOpenPanel", dialogsRef]);
        return "favorites";
      },
      getPanelDialog(panel: unknown, dialogsRef: any) {
        panelCalls.push(["getPanelDialog", panel, dialogsRef]);
        return dialogsRef[panel as keyof typeof dialogsRef];
      },
      openPanelDialog(options: unknown) {
        panelCalls.push(["openPanelDialog", options]);
      },
    },
  );

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

  currentState = {
    compositionMode: "full",
    emoji: "sparkles",
    emojiMode: "code",
    panel: "help",
  };
  navigation.applyDialogUrlState();
  assert.equal(openEmojiCalls.length, 1);
  assert.equal(drawCalls.includes("showEmojiDialog"), true);

  dialog.open = true;
  currentState = {
    compositionMode: "condensed",
    emoji: undefined,
    panel: "language",
  };
  navigation.applyDialogUrlState();
  assert.equal(drawCalls.includes("closeEmojiDialog"), true);
  assert.equal(
    panelCalls.some((call: any[]) => call[0] === "openPanelDialog"),
    false,
  );

  navigation.syncUrlState("push");
  assert.deepEqual(historyCalls[0], [
    "push",
    { page: 1 },
    "/index.en.html?built=query#top",
  ]);

  navigation.resetFilters();
  assert.equal(searchInput.value, "smile");
  assert.equal(drawCalls.includes("renderCategoryFilters"), true);
  assert.equal(searchInput.focused, true);

  navigation.onGenderChange({ currentTarget: { value: "neutral" } } as any);
  navigation.onSkinToneChange({ currentTarget: { value: "1F3FB" } } as any);
  navigation.onHairChange({ currentTarget: { value: "redHair" } } as any);
  assert.equal(
    filterCalls.filter((call: any[]) => call[0] === "applyExclusiveCheckboxSelection")
      .length,
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

  const typingEvent = {
    key: "?",
    preventDefaultCalled: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
  };
  (globalThis.document as any).activeElement = { tagName: "INPUT" };
  navigation.onDocumentKeyDown(typingEvent as any);
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
