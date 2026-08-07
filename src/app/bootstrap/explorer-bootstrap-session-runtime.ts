// @ts-nocheck -- Transitional bootstrap wiring.
import { buildExplorerBootstrapRuntimeOptions } from "./explorer-bootstrap-runtime-options.js";
import { createExplorerBootstrapRuntime } from "./explorer-bootstrap-runtime.js";
import { buildExplorerBootstrapRuntimeSourceOptions } from "./explorer-bootstrap-options.js";
import {
  assignExplorerBootstrapControls,
  assignExplorerBootstrapElements,
  assignExplorerBootstrapFieldsets,
} from "./explorer-bootstrap-bindings.js";
import * as state from "../../state.js";

export function initializeExplorerBootstrapSessionRuntime(options: any) {
  options.bindings.bootstrapRuntime = createExplorerBootstrapRuntime(
    buildExplorerBootstrapRuntimeOptions({
      ...buildExplorerBootstrapRuntimeSourceOptions({
        advancedFilters: () => options.bindings.advancedFilters,
        advancedFiltersButton: () => options.bindings.advancedFiltersButton,
        applyingUrlState: () => options.bindings.applyingUrlState,
        applyBasicUrlState: options.controllers.applyBasicUrlState,
        applyDialogUrlState: options.controllers.applyDialogUrlState,
        applyPixelArtworkClass: options.shell.applyPixelArtworkClass,
        applyStandalonePixelArtwork: options.shell.applyStandalonePixelArtwork,
        bindAudioInteractions: options.shell.bindAudioInteractions,
        clearFiltersButton: () => options.bindings.clearFiltersButton,
        copyStatus: () => options.bindings.copyStatus,
        developerModeEnabled: options.shell.developerModeEnabled,
        fullDeveloperModeEnabled: options.shell.fullDeveloperModeEnabled,
        developerModeToggle: () => options.bindings.developerModeToggle,
        modeChoices: () => options.bindings.modeChoices,
        displayGroupName: options.controllers.displayGroupName,
        drawList: options.bindings.drawList,
        emojiFontChoices: () => options.bindings.emojiFontChoices,
        emojiList: () => options.bindings.emojiList,
        genderCheckboxes: () => options.bindings.genderCheckboxes,
        focusInitialEmojiDialogAction: () =>
          options.bindings.focusInitialEmojiDialogAction(),
        getIntroducedVersion: options.shell.getIntroducedVersion,
        getPixelEditor: () => options.bindings.pixelEditor,
        getPixelEditorPromise: () => options.bindings.pixelEditorPromise,
        groupFilterDialog: () => options.bindings.groupFilterDialog,
        groupPickerTrigger: () => options.bindings.groupPickerTrigger,
        groupSelector: () => options.bindings.groupSelector,
        hairCheckboxes: () => options.bindings.hairCheckboxes,
        helpDialog: () => options.bindings.helpDialog,
        helpPicker: () => options.bindings.helpPicker,
        installApp: options.shell.installApp,
        installAppButton: () => options.bindings.installAppButton,
        installDialog: () => options.bindings.installDialog,
        languageDialog: () => options.bindings.languageDialog,
        languageList: () => options.bindings.languageList,
        languagePicker: () => options.bindings.languagePicker,
        languagePickerFlag: () => options.bindings.languagePickerFlag,
        languagePickerLabel: () => options.bindings.languagePickerLabel,
        loadData: options.controllers.loadData,
        loadSearchLanguages: () => options.bindings.loadSearchLanguages(),
        loadUiTranslations: options.shell.loadUiTranslations,
        matchCount: () => options.bindings.matchCount,
        navigateEmoji: (amount: number) =>
          options.bindings.navigateEmoji(amount),
        nextSearchLoadId: state.searchLoadId.increment,
        onClick: options.shell.onClick,
        onCompactChoiceKeyDown: options.controllers.onCompactChoiceKeyDown,
        onDocumentKeyDown: options.controllers.onDocumentKeyDown,
        onEmojiDialogClick: options.controllers.onEmojiDialogClick,
        onEmojiDialogClose: options.shell.onEmojiDialogClose,
        onEmojiFocus: options.controllers.onEmojiFocus,
        onHairChange: options.controllers.onHairChange,
        onEmojiKeyDown: options.controllers.onEmojiKeyDown,
        onGenderChange: options.controllers.onGenderChange,
        onSkinToneChange: options.controllers.onSkinToneChange,
        onOrderModeChange: options.controllers.onOrderModeChange,
        onVersionRangeInput: options.controllers.onVersionRangeInput,
        openFilterPicker: options.controllers.openFilterPicker,
        orderButtons: () => options.bindings.orderButtons,
        panelDialogs: options.panelDialogs,
        populateVersionModeOptions: options.bindings.populateVersionModeOptions,
        refreshLocalizedLabels: options.controllers.refreshLocalizedLabels,
        resetFilters: () => options.bindings.resetFilters(),
        renderCategoryFilters: options.controllers.renderCategoryFilters,
        renderDeveloperMode: options.shell.renderDeveloperMode,
        renderInstallAppButton: options.shell.renderInstallAppButton,
        renderPixelFontToggle: options.shell.renderPixelFontToggle,
        renderSavedEmoji: options.shell.renderSavedEmoji,
        renderSearchLanguages: () => options.bindings.renderSearchLanguages(),
        renderVersionModeToggle: () =>
          options.bindings.renderVersionModeToggle(),
        restoreDeveloperMode: options.restoreDeveloperMode,
        savedDialog: () => options.bindings.savedDialog,
        savedPicker: () => options.bindings.savedPicker,
        scheduleSearchDraw: options.controllers.scheduleSearchDraw,
        searchText: () => options.bindings.searchText,
        selectEmojiFont: options.shell.selectEmojiFont,
        setApplyingUrlState: (value: any) =>
          (options.bindings.applyingUrlState = value),
        setControls: (values: any) =>
          assignExplorerBootstrapControls(options.bindings, values),
        setDialogView: options.bindings.setEmojiDialogView,
        setElements: (values: any) =>
          assignExplorerBootstrapElements(options.bindings, values),
        setFieldsets: (values: any) =>
          assignExplorerBootstrapFieldsets(options.bindings, values),
        setPixelEditor: (editor: any) => {
          options.bindings.pixelEditor = editor;
        },
        setPixelEditorPromise: (promise: any) => {
          options.bindings.pixelEditorPromise = promise;
        },
        setSearchLanguage: state.selectedSearchLocale.set,
        setSuppressDialogCloseSync: (value: any) =>
          (options.bindings.suppressDialogCloseSync = value),
        setUrlStateReady: (value: any) =>
          (options.bindings.urlStateReady = value),
        showEmoji: options.bindings.showEmoji,
        skinToneCheckboxes: () => options.bindings.skinToneCheckboxes,
        stepVersion: options.controllers.stepVersion,
        subGroupFilterDialog: () => options.bindings.subGroupFilterDialog,
        subGroupPickerTrigger: () => options.bindings.subGroupPickerTrigger,
        subGroupSelector: () => options.bindings.subGroupSelector,
        suppressedPanelCloses: () => options.bindings.suppressedPanelCloses,
        syncUrlState: options.bindings.syncUrlState,
        syncVersionRange: options.controllers.syncVersionRange,
        themeChoices: () => options.bindings.themeChoices,
        toggleDeveloperMode: (...args: any[]) =>
          options.shell.toggleDeveloperMode(...args),
        toggleVersionMode: (...args: any[]) =>
          options.bindings.toggleVersionMode(...args),
        toolbar: () => options.bindings.toolbar,
        translate: options.translate,
        updateCompositionBackButton:
          options.bindings.updateCompositionBackButton,
        updateDialogNavigation: options.bindings.updateDialogNavigation,
        updateEmojiComposition: options.shell.updateEmojiComposition,
        updateFavoriteButton: options.shell.updateFavoriteButton,
        updateModifierArtwork: options.shell.updateModifierPixelArtwork,
        updateOnlineStatus: options.shell.updateOnlineStatus,
        updatePixelArtworkManifest: options.shell.updatePixelArtworkManifest,
        updateRenderingDiagnostic: options.shell.updateRenderingDiagnostic,
        urlStateReady: () => options.bindings.urlStateReady,
        versionModeSelector: () => options.bindings.versionModeSelector,
        versionModeToggle: () => options.bindings.versionModeToggle,
        versionNext: () => options.bindings.versionNext,
        versionPrevious: () => options.bindings.versionPrevious,
        versionRange: () => options.bindings.versionRange,
        versionSelector: () => options.bindings.versionSelector,
      }),
    }),
  );

  Object.assign(options.bindings, {
    populateVersionModeOptions:
      options.bindings.bootstrapRuntime.populateVersionModeOptions,
    renderVersionModeToggle:
      options.bindings.bootstrapRuntime.renderVersionModeToggleController,
    toggleVersionMode: options.bindings.bootstrapRuntime.toggleVersionMode,
    loadSearchLanguages: options.bindings.bootstrapRuntime.loadSearchLanguages,
    renderSearchLanguages:
      options.bindings.bootstrapRuntime.renderSearchLanguages,
    showEmoji: options.bindings.bootstrapRuntime.showEmoji,
    navigateEmoji: options.bindings.bootstrapRuntime.navigateEmoji,
    updateDialogNavigation:
      options.bindings.bootstrapRuntime.updateDialogNavigation,
    updateCompositionBackButton:
      options.bindings.bootstrapRuntime.updateCompositionBackButton,
    revealExplorer: options.bindings.bootstrapRuntime.revealExplorer,
  });

  return options.bindings.bootstrapRuntime;
}
