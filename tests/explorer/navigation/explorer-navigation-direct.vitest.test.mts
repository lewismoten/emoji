import { afterEach, describe, expect, it } from "vitest";

import * as state from "../../../src/state.js";
import {
  createExplorerNavigation,
} from "../../../src/explorer/navigation/explorer-navigation-controller.js";
import {
  createExplorerNavigationDependencies,
} from "../../../src/explorer/navigation/explorer-navigation-dependencies.js";
import {
  createExplorerNavigationDirectFixture,
  installExplorerNavigationGlobals,
} from "./explorer-navigation-direct-fixture.mjs";

describe("explorer-navigation direct", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalEvent = Object.getOwnPropertyDescriptor(globalThis, "Event");
  const asAny = (value: unknown) => value as any;
  const createBaseNavigationOptions = (overrides: Record<string, unknown> = {}) =>
    ({
      allowedSequenceTypes: [],
      applyingUrlState: () => false,
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
      urlStateReady: () => true,
      versionModeSelector: () => asAny({ value: "through" }),
      versionRange: () => asAny({ value: "0", dispatchEvent() {} }),
      versionSelector: () => asAny({ value: "", options: { length: 0 } }),
      ...overrides,
    }) as any;

  afterEach(() => {
    state.emojiByKey.replace({});
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
  });

  it("covers URL, panel, filter, and keyboard navigation flows", async () => {
    const defaults = createExplorerNavigationDependencies();
    expect(typeof defaults.parseExplorerUrlState).toBe("function");
    expect(typeof defaults.buildExplorerUrlQuery).toBe("function");
    expect(typeof defaults.getPanelDialog).toBe("function");
    expect(typeof defaults.openPanelDialog).toBe("function");

    const fixture = createExplorerNavigationDirectFixture();
    const defaultNavigation = createExplorerNavigation(
      createBaseNavigationOptions({
        applyingUrlState: () => true,
        urlStateReady: () => false,
      }),
    );
    expect(typeof defaultNavigation.syncUrlState).toBe("function");

    installExplorerNavigationGlobals(fixture);
    (globalThis.document as any).documentElement.dataset = {};
    state.emojiByKey.replace({ sparkles: "✨" });

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
          fixture.filterCalls.push([
            "applyExclusiveCheckboxSelection",
            list,
            current,
          ]);
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
        stepVersionIndex(current: number, length: number, amount: number) {
          fixture.filterCalls.push(["stepVersionIndex", current, length, amount]);
          return current + amount;
        },
        closePanelDialog(dialogRef: unknown, suppressed: unknown) {
          fixture.panelCalls.push(["closePanelDialog", dialogRef, suppressed]);
        },
        ensurePanelDialogLifecycleBound(options: unknown) {
          fixture.panelCalls.push(["ensurePanelDialogLifecycleBound", options]);
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
    expect(fixture.selectedValues.slice(0, 3)).toEqual([
      ["orderMode", "popular"],
      ["sequenceType", "modifier"],
      ["compositionMode", "condensed"],
    ]);

    navigation.applyLoadedUrlState();
    expect(fixture.selectedValues.slice(3, 5)).toEqual([
      ["group", "Objects"],
      ["subGroup", "Objects::mail"],
    ]);
    expect(fixture.drawCalls.includes("renderVersionModeToggle")).toBe(true);
    expect(fixture.drawCalls.includes("syncVersionRange")).toBe(true);

    fixture.setCurrentState({
      compositionMode: "full",
      emoji: "sparkles",
      emojiMode: "code",
      panel: "help",
    });
    await navigation.applyDialogUrlState();
    expect(fixture.openEmojiCalls).toHaveLength(1);
    expect(fixture.drawCalls.includes("showEmojiDialog")).toBe(true);

    fixture.dialog.open = true;
    fixture.setCurrentState({
      compositionMode: "condensed",
      emoji: undefined,
      panel: "language",
    });
    await navigation.applyDialogUrlState();
    expect(fixture.drawCalls.includes("closeEmojiDialog")).toBe(true);
    expect(
      fixture.panelCalls.some((call: any[]) => call[0] === "openPanelDialog"),
    ).toBe(false);

    fixture.dialogs.help.open = false;
    fixture.setCurrentState({
      compositionMode: "condensed",
      emoji: undefined,
      panel: "help",
    });
    await navigation.applyDialogUrlState();
    expect(
      fixture.panelCalls.some(
        (call: any[]) =>
          call[0] === "openPanelDialog" && call[1]?.panel === "help",
      ),
    ).toBe(true);

    (globalThis.document as any).documentElement.dataset.explorerMode = "advanced";
    navigation.syncUrlState("push");
    expect(fixture.historyCalls[0]).toEqual([
      "push",
      "/index.en.html?built=query#top",
      { page: 1 },
    ]);
    expect(
      fixture.urlStateCalls.some(
        (call: any[]) =>
          call[0] === "buildExplorerUrlQuery" &&
          call[1]?.explorerMode === "advanced",
      ),
    ).toBe(true);

    fixture.urlStateCalls.length = 0;
    (globalThis.document as any).documentElement ??= { dataset: {} };
    (globalThis.document as any).documentElement.dataset ??= {};
    (globalThis.document as any).documentElement.dataset.explorerMode = "developer";
    navigation.syncUrlState("replace");
    expect(
      fixture.urlStateCalls.some(
        (call: any[]) =>
          call[0] === "buildExplorerUrlQuery" &&
          call[1]?.explorerMode === "developer",
      ),
    ).toBe(true);

    Reflect.deleteProperty(globalThis, "window");
    navigation.applyLoadedUrlState();
    navigation.syncUrlState("replace");
    expect(
      fixture.urlStateCalls.some(
        (call: any[]) =>
          call[0] === "parseExplorerUrlState" && call[1]?.search === "",
      ),
    ).toBe(true);

    navigation.resetFilters();
    expect(fixture.searchInput.value).toBe("smile");
    expect(fixture.drawCalls.includes("renderCategoryFilters")).toBe(true);
    expect(fixture.searchInput.focused).toBe(true);

    navigation.onGenderChange(asAny({ currentTarget: { value: "neutral" } }));
    navigation.onSkinToneChange(asAny({ currentTarget: { value: "1F3FB" } }));
    navigation.onHairChange(asAny({ currentTarget: { value: "redHair" } }));
    expect(
      fixture.filterCalls.filter(
        (call: any[]) => call[0] === "applyExclusiveCheckboxSelection",
      ).length,
    ).toBe(3);

    navigation.stepVersion(2);
    expect(fixture.versionRange.value).toBe("3");
    expect(fixture.versionRange.dispatched[0]?.type).toBe("input");

    const helpEvent = {
      key: "?",
      preventDefaultCalled: false,
      preventDefault() {
        this.preventDefaultCalled = true;
      },
    };
    navigation.onDocumentKeyDown(asAny(helpEvent));
    expect(helpEvent.preventDefaultCalled).toBe(true);

    const slashEvent = {
      key: "/",
      preventDefaultCalled: false,
      preventDefault() {
        this.preventDefaultCalled = true;
      },
    };
    navigation.onDocumentKeyDown(asAny(slashEvent));
    expect(slashEvent.preventDefaultCalled).toBe(true);

    const escapeEvent = { key: "Escape" };
    navigation.onDocumentKeyDown(asAny(escapeEvent));
    expect(fixture.searchInput.value).toBe("");

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
    expect(arrowEvent.preventDefaultCalled).toBe(true);
    expect(fixture.navigationCalls).toEqual([1]);

    const typingEvent = {
      key: "?",
      preventDefaultCalled: false,
      preventDefault() {
        this.preventDefaultCalled = true;
      },
    };
    (globalThis.document as any).activeElement = { tagName: "INPUT" };
    navigation.onDocumentKeyDown(asAny(typingEvent));
    expect(typingEvent.preventDefaultCalled).toBe(false);

    Reflect.deleteProperty(globalThis, "document");
    const noDocumentNavigation = createExplorerNavigation(
      createBaseNavigationOptions({
        searchText: () => asAny({ value: "" }),
        subGroupSelectionKey: () => "",
      }),
    );
    noDocumentNavigation.syncUrlState("replace");

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: {},
          dataset: {},
        },
      },
    });
    const developerFallbackNavigation = createExplorerNavigation(
      createBaseNavigationOptions({
        fullDeveloperModeEnabled: () => true,
        searchText: () => asAny({ value: "" }),
        subGroupSelectionKey: () => "",
      }),
    );
    developerFallbackNavigation.applyBasicUrlState();

    const standardFallbackCalls: any[] = [];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: {},
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        history: {
          state: {},
          pushState() {},
          replaceState() {},
        },
        location: { hash: "", pathname: "/index.en.html", search: "" },
      },
    });
    const standardFallbackNavigation = createExplorerNavigation(
      createBaseNavigationOptions({
        searchText: () => asAny({ value: "" }),
        subGroupSelectionKey: () => "",
      }),
      {
        ...defaults,
        buildExplorerUrlQuery(options: unknown) {
          standardFallbackCalls.push(options);
          return "";
        },
      },
    );
    standardFallbackNavigation.syncUrlState("replace");
    expect(standardFallbackCalls[0]?.explorerMode).toBe("standard");

    const lateDialogs = {
      favorites: undefined,
      filters: undefined,
      help: undefined,
      language: undefined,
    } as any;
    const ensuredPanels: string[] = [];
    const ensuredPanelCalls: any[] = [];
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        activeElement: { tagName: "DIV" },
        documentElement: { dataset: { explorerMode: "advanced" }, dir: "ltr" },
        querySelector() {
          return null;
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        history: {
          state: {},
          pushState() {},
          replaceState() {},
        },
        location: {
          hash: "",
          pathname: "/index.en.html",
          search: "?panel=filters",
        },
      },
    });
    const ensuredPanelNavigation = createExplorerNavigation(
      {
        ...createBaseNavigationOptions({
          panelDialogs: () => lateDialogs,
          searchText: () => asAny({ value: "" }),
          subGroupSelectionKey: () => "",
        }),
        ensurePanelDialog(panel: string) {
          ensuredPanels.push(panel);
          lateDialogs.filters = { id: "filters" };
        },
      },
      {
        ...defaults,
        closePanelDialog() {},
        ensurePanelDialogLifecycleBound(options: unknown) {
          ensuredPanelCalls.push(["ensurePanelDialogLifecycleBound", options]);
        },
        getPanelDialog(panel: unknown, dialogsRef: any) {
          ensuredPanelCalls.push(["getPanelDialog", panel, dialogsRef]);
          return dialogsRef[panel as keyof typeof dialogsRef];
        },
        getOpenPanel() {
          return "";
        },
        openPanelDialog(options: unknown) {
          ensuredPanelCalls.push(["openPanelDialog", options]);
        },
        parseExplorerUrlState() {
          return {
            compositionMode: "full",
            emoji: "",
            emojiMode: "details",
            gender: [],
            group: "",
            hair: [],
            order: "unicode",
            panel: "filters",
            search: "",
            sequenceType: "",
            skin: [],
            subGroup: "",
            version: "",
            versionMode: "through",
          };
        },
      },
    );
    await ensuredPanelNavigation.applyDialogUrlState();
    expect(ensuredPanels).toEqual(["filters"]);
    expect(
      ensuredPanelCalls.some(
        (call: any[]) =>
          call[0] === "openPanelDialog" && call[1]?.panel === "filters",
      ),
    ).toBe(true);
  });
});
