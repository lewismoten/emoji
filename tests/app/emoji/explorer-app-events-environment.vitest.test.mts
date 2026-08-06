import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

import * as sourceModule from "../../../src/app/explorer-app-events.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

afterAll(() => {
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

describe("explorer-app-events environment", () => {
  it("uses window/document fallbacks and deferred language picker lookups", async () => {
    const bindPanelDialogCalls: any[] = [];
    const fallbackLanguagePicker = { addEventListener() {} } as any;
    const requestAnimationFrameCalls: Function[] = [];

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener() {},
        matchMedia: () => ({ addEventListener() {} }),
        requestAnimationFrame(callback: Function) {
          requestAnimationFrameCalls.push(callback);
          callback();
        },
        setTimeout,
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        addEventListener() {},
        querySelector(selector: string) {
          return selector === ".language-picker" ? fallbackLanguagePicker : null;
        },
        querySelectorAll() {
          return [];
        },
      },
    });

    const dialogs = [{ id: "fallback" }];
    const languageList = ["es"];
    const lifecycleCalls: string[] = [];
    sourceModule.bindExplorerEvents(
      {
        advancedFiltersButton: { focus() {} },
        applyBasicUrlState() {},
        applyingUrlState: false,
        clearFiltersButton: { addEventListener() {} },
        closePanel() {},
        developerModeToggle: { addEventListener() {} },
        emojiFontChoices: [],
        emojiList: { addEventListener() {} },
        emojiNext: { addEventListener() {} },
        emojiPrevious: { addEventListener() {} },
        exampleDialog: { addEventListener() {} },
        genderCheckboxes: [],
        getAdvancedFiltersDialog() {
          return { id: "filters" };
        },
        getHelpDialog() {
          return undefined;
        },
        getLanguageDialog() {
          return undefined;
        },
        getLanguageList() {
          return languageList;
        },
        getSavedDialog() {
          return undefined;
        },
        hairCheckboxes: [],
        helpPicker: {},
        installApp() {},
        installAppButton: { addEventListener() {} },
        installDialog: {
          close() {},
          querySelector: () => ({ addEventListener() {} }),
        },
        installedDisplayQueries: [],
        navigateEmoji() {},
        onClick() {},
        onDocumentKeyDown() {},
        onEmojiDialogClick() {},
        onEmojiDialogClose() {},
        onEmojiFocus() {},
        onEmojiKeyDown() {},
        onGenderChange() {},
        onHairChange() {},
        onOrderModeChange() {},
        onSkinToneChange() {},
        onVersionRangeInput() {},
        openPanel() {},
        orderButtons: [],
        panelDialogs: () => dialogs,
        positionFavoriteButton() {},
        refreshElements() {
          lifecycleCalls.push("refresh-elements");
        },
        renderDeveloperMode() {
          lifecycleCalls.push("render-developer-mode");
        },
        renderInstallAppButton() {},
        renderPixelFontToggle() {
          lifecycleCalls.push("render-pixel-font-toggle");
        },
        renderSavedEmoji() {},
        renderSearchLanguages() {
          lifecycleCalls.push("render-search-languages");
        },
        resetFilters() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: { addEventListener() {} },
        selectEmojiFont() {},
        skinToneCheckboxes: [],
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        syncVersionRange() {},
        toggleDeveloperMode() {},
        toggleVersionMode() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionModeToggle: { addEventListener() {} },
        versionNext: { addEventListener() {} },
        versionPrevious: { addEventListener() {} },
        versionRange: { addEventListener() {} },
        versionSelector: { addEventListener() {} },
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog(options: unknown) {
          bindPanelDialogCalls.push(options);
        },
        bindSavedDialogInteractions() {},
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
    );

    assert.equal(bindPanelDialogCalls[1].button, fallbackLanguagePicker);
    assert.equal(bindPanelDialogCalls[1].getDialog(), undefined);
    assert.equal(bindPanelDialogCalls[2].getDialog(), undefined);
    assert.deepEqual(bindPanelDialogCalls[3].getDialog(), { id: "filters" });
    assert.deepEqual(bindPanelDialogCalls[1].getDialogs(), dialogs);
    assert.deepEqual(bindPanelDialogCalls[1].getLanguageList(), languageList);
    await bindPanelDialogCalls[2].onAfterOpen();
    assert.equal(requestAnimationFrameCalls.length, 1);
    assert.equal(lifecycleCalls.includes("refresh-elements"), true);
  });

  it("tolerates missing global window and document objects", () => {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");

    sourceModule.bindExplorerEvents(
      {
        advancedFiltersButton: { addEventListener() {}, focus() {} },
        applyBasicUrlState() {},
        applyingUrlState: false,
        clearFiltersButton: { addEventListener() {} },
        closePanel() {},
        developerModeToggle: { addEventListener() {} },
        emojiFontChoices: [],
        emojiList: { addEventListener() {} },
        emojiNext: { addEventListener() {} },
        emojiPrevious: { addEventListener() {} },
        exampleDialog: { addEventListener() {} },
        genderCheckboxes: [],
        hairCheckboxes: [],
        helpPicker: {},
        installAppButton: { addEventListener() {} },
        installedDisplayQueries: [],
        openPanel() {},
        orderButtons: [],
        panelDialogs: () => [],
        renderInstallAppButton() {},
        renderSavedEmoji() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: { addEventListener() {} },
        skinToneCheckboxes: [],
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionModeToggle: { addEventListener() {} },
        versionNext: { addEventListener() {} },
        versionPrevious: { addEventListener() {} },
        versionRange: { addEventListener() {} },
        versionSelector: { addEventListener() {} },
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog() {},
        bindSavedDialogInteractions() {},
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
    );
  });
});
