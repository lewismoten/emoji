import {
  getIntroducedVersion as getIntroducedVersionHelper,
  withoutDialogParentPanel,
  withoutCompositionParent,
} from "../../explorer/dialog/dialog-runtime-helpers.js";
import {
  loadPackageManifest as loadPackageManifestHelper,
  renderImportExamples as renderImportExamplesHelper,
} from "../../explorer/emoji/import-examples.js";
import { updateExplorerComposition } from "../../explorer-composition-controller.js";
import { copyToClipboard } from "../../explorer/saved-emoji.js";

/** Coordinate emoji detail actions without retaining DOM state in index.ts. */
export function createEmojiActions(options: any) {
  const updateEmojiImportExamples = (item: any) =>
    renderImportExamplesHelper(options.state().packageManifest, item);

  const loadManifest = () =>
    loadPackageManifestHelper({
      getManifest: () => options.state().packageManifest,
      getPromise: () => options.state().packageManifestPromise,
      setManifest: (manifest: unknown) =>
        (options.state().packageManifest = manifest),
      setPromise: (promise: Promise<unknown>) =>
        (options.state().packageManifestPromise = promise),
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
      versionKeys: options.state().versionKeys,
      versionManifests: options.state().versionManifests,
      proposedVersionManifests: options.state().proposedVersionManifests,
    });

  const onClick = (event: any, openDialog = true) => {
    const cell = event.target.closest?.("[data-emoji-key]");
    const id = cell?.id ?? event.target.id;
    if (options.state().emojiByKey[id] === undefined) return;
    cell?.focus();
    options.showEmoji(id, openDialog);
  };

  const onEmojiDialogClose = () => {
    options.setDialogView("details", false);
    options.state().currentDialogParentStack = [];
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
        byId: () => options.state().byId,
        compositionMode: () => options.state().compositionMode,
        developerModeEnabled: options.developerModeEnabled,
        dialog: options.dialog,
        emojiByKey: () => options.state().emojiByKey,
        emojiKeyByCodePoints: () => options.state().emojiKeyByCodePoints,
        searchAnnotations: () => options.state().searchAnnotations,
        selectedLocale: () => options.state().selectedSearchLocale,
        translate: options.translate,
      },
      item,
      value,
    );

  const rebuildEmojiCodePointLookup = () => {
    options.state().emojiKeyByCodePoints = options
      .state()
      .items.reduce((lookup: Map<string, string>, item: any) => {
        const codePoints = options.normalizeCodePoints(item.codePoints);
        if (
          codePoints &&
          (!lookup.has(codePoints) || item.status === "fully-qualified")
        ) {
          lookup.set(codePoints, item.key);
        }
        return lookup;
      }, new Map<string, string>());
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
