import { loadExplorerCatalog } from "../explorer/catalog-loader.js";
import { loadVersionCatalog } from "../explorer/version-data.js";
import { createVersionController } from "./version-controller.js";

export function createVersionRuntime(options: any) {
  return createVersionController({
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
        allIds: () => options.state().allIds,
        byId: () => options.state().byId,
        emojiByKey: () => options.state().emojiByKey,
        getExplorerSubGroup: options.getExplorerSubGroup,
        items: () => options.state().items,
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
    state: () => options.state(),
    subGroupSelector: () => options.subGroupSelector(),
    translate: options.translate,
    updateModifierArtwork: () => options.updateModifierArtwork(),
    versionModeSelector: () => options.versionModeSelector(),
    versionNext: () => options.versionNext(),
    versionPrevious: () => options.versionPrevious(),
    versionRange: () => options.versionRange(),
    versionRangeValue: () => options.versionRangeValue(),
    versionSelector: () => options.versionSelector(),
  });
}
