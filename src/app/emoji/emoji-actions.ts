import {
  getIntroducedVersion as getIntroducedVersionHelper,
  withoutDialogParentPanel,
  withoutCompositionParent,
} from "../../explorer/dialog/dialog-runtime-helpers.js";
import {
  loadPackageManifest as loadPackageManifestHelper,
  renderImportExamples as renderImportExamplesHelper,
} from "../../explorer/emoji/import-examples.js";
import { updateExplorerComposition } from "../../explorer/dialog/explorer-composition-controller.js";
import { copyToClipboard } from "../../explorer/saved-emoji.js";
import * as state from "../../state.js";

/** Coordinate emoji detail actions without retaining DOM state in index.ts. */
export function createEmojiActions(options: any) {
  const updateEmojiImportExamples = (item: any) =>
    renderImportExamplesHelper(state.packageManifest.get(), item);

  const loadManifest = () =>
    loadPackageManifestHelper({
      getManifest: state.packageManifest.get,
      getPromise: state.packageManifestPromise.get,
      setManifest: state.packageManifest.set,
      setPromise: state.packageManifestPromise.set,
    });

  const copyToClipboardValue = (value: string, successMessage: string) =>
    copyToClipboard({
      value,
      successMessage,
      copyStatus: options.copyStatus(),
      translate: options.translate,
    });

  const getIntroducedVersion = (key: string) =>
    getIntroducedVersionHelper({
      key,
      versionKeys: state.versionKeys.get(),
      versionManifests: state.versionManifests.get(),
      proposedVersionManifests: state.proposedVersionManifests.get(),
    });

  const onClick = (event: any, openDialog = true) => {
    const cell = event.target.closest?.("[data-emoji-key]");
    const id = cell?.id ?? event.target.id;
    if (state.emojiByKey.get()[id] === undefined) return;
    cell?.focus();
    options.showEmoji(id, openDialog);
  };

  const onEmojiDialogClose = () => {
    options.setDialogView("details", false);
    state.currentDialogParentStack.set([]);
    options.dialog().dataset.dialogParentPanel = "";
    if (
      options.suppressDialogCloseSync() ||
      !options.urlStateReady() ||
      options.applyingUrlState()
    )
      return;
    if (
      window.history.state?.emojiDialogEntry &&
      !window.history.state?.dialogParentPanel
    ) {
      window.history.back();
    } else {
      options.syncUrlState(
        "replace",
        withoutDialogParentPanel(
          withoutCompositionParent(window.history.state),
        ),
      );
    }
  };

  const updateEmojiComposition = (item: any, value: string) =>
    updateExplorerComposition(
      {
        applyPixelArtworkClass: options.applyPixelArtworkClass(),
        applyStandalonePixelArtwork: options.applyStandalonePixelArtwork(),
        byId: state.byId.get,
        compositionMode: state.compositionMode.get,
        developerModeEnabled: options.developerModeEnabled,
        dialog: options.dialog,
        emojiByKey: state.emojiByKey.get,
        emojiKeyByCodePoints: state.emojiKeyByCodePoints.get,
        searchAnnotations: state.searchAnnotations.get,
        selectedLocale: state.selectedSearchLocale.get,
        translate: options.translate,
      },
      item,
      value,
    );

  const rebuildEmojiCodePointLookup = () => {
    const items = state.items.get();
    state.emojiKeyByCodePoints.set(
      items.reduce((lookup: Map<string, string>, item: any) => {
        const codePoints = options.normalizeCodePoints(item.codePoints);
        if (
          codePoints &&
          (!lookup.has(codePoints) || item.status === "fully-qualified")
        ) {
          lookup.set(codePoints, item.key);
        }
        return lookup;
      }, new Map<string, string>()),
    );
  };

  return {
    copyToClipboardValue,
    getIntroducedVersion,
    loadPackageManifest: loadManifest,
    onClick,
    onEmojiDialogClose,
    rebuildEmojiCodePointLookup,
    updateEmojiComposition,
    updateEmojiImportExamples,
  };
}
