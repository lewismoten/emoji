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

describe("explorer-app-events fallback", () => {
  it("lazily binds saved, language, help, and filter dialogs when utilities are created", async () => {
    const bindSavedDialogInteractionsCalls: any[] = [];
    const bindPanelDialogCalls: any[] = [];
    const createEventTarget = () => ({ addEventListener() {} });
    const buttonListeners = new Map<string, Function[]>();
    const customButton = {
      addEventListener(type: string, handler: Function) {
        const list = buttonListeners.get(type) ?? [];
        list.push(handler);
        buttonListeners.set(type, list);
      },
    } as any;
    const savedDialog = {} as any;
    let currentSavedDialog: any;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener() {},
        matchMedia: () => ({ addEventListener() {} }),
        setTimeout,
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { explorerMode: "standard" } },
        addEventListener() {},
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
      },
    });

    sourceModule.bindExplorerEvents(
      {
        advancedFiltersButton: { focus() {} },
        applyBasicUrlState() {},
        applyingUrlState: false,
        closePanel() {},
        clearFiltersButton: createEventTarget(),
        developerModeToggle: createEventTarget(),
        emojiList: createEventTarget(),
        emojiNext: createEventTarget(),
        emojiPrevious: createEventTarget(),
        exampleDialog: createEventTarget(),
        emojiFontChoices: [],
        helpDialog: {},
        genderCheckboxes: [],
        hairCheckboxes: [],
        helpPicker: {},
        installApp() {},
        installAppButton: createEventTarget(),
        installDialog: { close() {}, querySelector: () => createEventTarget() },
        installedDisplayQueries: [],
        getSavedDialog() {
          return currentSavedDialog;
        },
        languageDialog: {},
        languagePicker: () => customButton,
        languageList: [],
        navigateEmoji() {},
        onClick() {},
        onDocumentKeyDown() {},
        onEmojiDialogClick() {},
        onEmojiDialogClose() {},
        onEmojiFocus() {},
        onEmojiKeyDown() {},
        orderButtons: [],
        onGenderChange() {},
        onOrderModeChange() {},
        onHairChange() {},
        onSkinToneChange() {},
        onVersionRangeInput() {},
        openPanel() {},
        panelDialogs: () => [],
        renderInstallAppButton() {},
        renderSavedEmoji() {},
        resetFilters() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: { addEventListener() {} },
        selectEmojiFont() {},
        skinToneCheckboxes: [],
        ensureUtilityPanel(panel: string) {
          if (panel === "favorites") currentSavedDialog = savedDialog;
        },
        stepVersion() {},
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        syncVersionRange() {},
        toggleDeveloperMode() {},
        toggleVersionMode() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionNext: createEventTarget(),
        versionPrevious: createEventTarget(),
        versionRange: { addEventListener() {} },
        versionSelector: { addEventListener() {} },
        versionModeToggle: { addEventListener() {} },
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog(options: unknown) {
          bindPanelDialogCalls.push(options);
        },
        bindSavedDialogInteractions(options: unknown) {
          bindSavedDialogInteractionsCalls.push(options);
        },
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
    );

    assert.equal(typeof customButton.dataset, "object");
    assert.equal(bindPanelDialogCalls[0].getDialog(), undefined);
    assert.deepEqual(bindPanelDialogCalls[0].getDialogs(), []);
    assert.deepEqual(bindPanelDialogCalls[1].getLanguageList(), []);
    assert.deepEqual(bindPanelDialogCalls[1].getDialog(), {});
    assert.deepEqual(bindPanelDialogCalls[2].getDialog(), {});
    assert.equal(bindPanelDialogCalls[3].getDialog(), undefined);
    assert.equal(bindSavedDialogInteractionsCalls.length, 0);

    await bindPanelDialogCalls[0].ensureDialog();
    await bindPanelDialogCalls[1].ensureDialog();
    await bindPanelDialogCalls[2].ensureDialog();
    await bindPanelDialogCalls[3].ensureDialog();

    assert.equal(savedDialog.dataset.savedDialogBound, "true");
    assert.equal(bindSavedDialogInteractionsCalls.length, 1);
  });
});
