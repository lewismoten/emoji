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
  const providedState = options.state?.();
  const getValue: any = (getter, key) =>
    () => providedState?.[key] ?? getter();
  const updateEmojiImportExamples = (item: any) =>
    renderImportExamplesHelper(
      providedState?.packageManifest ?? state.packageManifest.get(),
      item,
    );

  const loadManifest = () =>
    loadPackageManifestHelper({
      getManifest: getValue(state.packageManifest.get, "packageManifest"),
      getPromise: getValue(
        state.packageManifestPromise.get,
        "packageManifestPromise",
      ),
      setManifest: (value: any) => {
        if (providedState) providedState.packageManifest = value;
        else state.packageManifest.set(value);
      },
      setPromise: (value: any) => {
        if (providedState) providedState.packageManifestPromise = value;
        else state.packageManifestPromise.set(value);
      },
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
      versionKeys: providedState?.versionKeys ?? state.versionKeys.get(),
      versionManifests:
        providedState?.versionManifests ?? state.versionManifests.get(),
      proposedVersionManifests:
        providedState?.proposedVersionManifests ??
        state.proposedVersionManifests.get(),
    });

  const onClick = (event: any, openDialog = true) => {
    const cell = event.target.closest?.("[data-emoji-key]");
    const id = cell?.id ?? event.target.id;
    if ((providedState?.emojiByKey ?? state.emojiByKey.get())[id] === undefined)
      return;
    cell?.focus();
    options.showEmoji(id, openDialog);
  };

  const onEmojiDialogClose = () => {
    options.setDialogView("details", false);
    if (providedState) providedState.currentDialogParentStack = [];
    else state.currentDialogParentStack.set([]);
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
        compositionMode: getValue(state.compositionMode.get, "compositionMode"),
        developerModeEnabled: options.developerModeEnabled,
        dialog: options.dialog,
        emojiKeyByCodePoints: getValue(
          state.emojiKeyByCodePoints.get,
          "emojiKeyByCodePoints",
        ),
        selectedLocale: getValue(
          state.selectedSearchLocale.get,
          "selectedSearchLocale",
        ),
        translate: options.translate,
      },
      item,
      value,
    );

  const rebuildEmojiCodePointLookup = () => {
    const items = providedState?.items ?? state.items.get();
    const lookup = items.reduce((lookup: Map<string, string>, item: any) => {
        const codePoints = options.normalizeCodePoints(item.codePoints);
        if (
          codePoints &&
          (!lookup.has(codePoints) || item.status === "fully-qualified")
        ) {
          lookup.set(codePoints, item.key);
        }
        return lookup;
      }, new Map<string, string>());
    if (providedState) providedState.emojiKeyByCodePoints = lookup;
    else state.emojiKeyByCodePoints.replace(lookup);
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
