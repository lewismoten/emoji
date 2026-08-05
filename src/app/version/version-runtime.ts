import { loadExplorerCatalog } from "../../explorer/catalog-loader.js";
import { loadVersionCatalog } from "../../explorer/filters/version-data.js";
import { createVersionController } from "./version-controller.js";
import * as state from "../../state.js";

export function createVersionConfig(options: any) {
  return {
    applyLoadedUrlState: () => options.applyLoadedUrlState(),
    buildRepresentatives: options.buildRepresentatives,
    developerModeEnabled: options.developerModeEnabled,
    drawList: () => options.drawList(),
    getEmojiGenders: (item: any) => options.getEmojiGenders(item),
    getIntroducedVersion: options.getIntroducedVersion,
    groupSelector: () => options.groupSelector(),
    genderCheckboxes: () => options.genderCheckboxes(),
    genderFieldset: () => options.genderFieldset(),
    hairCheckboxes: () => options.hairCheckboxes(),
    hairFieldset: () => options.hairFieldset(),
    loadCatalog: () =>
      loadExplorerCatalog({
        getExplorerSubGroup: options.getExplorerSubGroup,
        isViteDevelopment: options.isViteDevelopment,
        updatePixelArtworkManifest: options.updatePixelArtworkManifest,
      }),
    loadVersionCatalog: () =>
      loadVersionCatalog({
        allIds: state.allIds.get,
        byId: state.byId.get,
        emojiByKey: state.emojiByKey.get,
        getExplorerSubGroup: options.getExplorerSubGroup,
        items: state.items.get,
      }),
    modifierFilters: () => options.modifierFilters(),
    onGroupChange: options.onGroupChange,
    onSequenceTypeChange: options.onSequenceTypeChange,
    onSubGroupChange: options.onSubGroupChange,
    openEmoji: (
      key: string,
      open: boolean,
      _navigationKeys: string[] | undefined,
      initialMode: string | undefined,
    ) => {
      options.onClick({ target: { id: key } }, open);
      if (open !== false && initialMode && initialMode !== "details") {
        options.setDialogView(initialMode, false);
      }
    },
    rebuildCodePointLookup: options.rebuildCodePointLookup,
    renderCategoryFilters: () => options.renderCategoryFilters(),
    setIntroducedVersion: (value: string) => {
      const node = document.getElementsByClassName("emoji-version")[0] as
        HTMLElement | undefined;
      if (node) node.innerText = value;
    },
    sequenceTypeSelector: () => options.sequenceTypeSelector(),
    skinToneCheckboxes: () => options.skinToneCheckboxes(),
    skinToneFieldset: () => options.skinToneFieldset(),
    subGroupSelector: () => options.subGroupSelector(),
    translate: options.translate,
    updateModifierArtwork: () => options.updateModifierArtwork(),
    versionModeSelector: () => options.versionModeSelector(),
    versionNext: () => options.versionNext(),
    versionPrevious: () => options.versionPrevious(),
    versionRange: () => options.versionRange(),
    versionRangeValue: () => options.versionRangeValue(),
    versionSelector: () => options.versionSelector(),
  };
}

export function createVersionRuntime(options: any) {
  return createVersionController(createVersionConfig(options));
}
