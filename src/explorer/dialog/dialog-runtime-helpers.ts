import {
  resolveCompositionParentLabel,
  resolveDialogNavigationState,
} from "./dialog-state.js";

export function getIntroducedVersion(options: {
  key: string;
  versionKeys: Map<string, Set<string>>;
  versionManifests: Array<{ version: string }>;
  proposedVersionManifests: Array<{ version: string }>;
}) {
  return (
    [...options.versionManifests, ...options.proposedVersionManifests].find(
      (version) => options.versionKeys.get(version.version)?.has(options.key),
    )?.version ?? "—"
  );
}

export function withoutCompositionParent(
  state: Record<string, unknown> | null | undefined,
) {
  const nextState = { ...(state ?? {}) };
  delete nextState.compositionParent;
  return nextState;
}

export function withoutDialogParentPanel(
  state: Record<string, unknown> | null | undefined,
) {
  const nextState = { ...(state ?? {}) };
  delete nextState.dialogParentPanel;
  return nextState;
}

export function updateDialogNavigation(options: {
  currentEmojiKey: string;
  dialogNavigationKeys: string[];
  displayedKeys: string[];
  emojiNext?: HTMLButtonElement;
  emojiPrevious?: HTMLButtonElement;
  updateCompositionBackButton: () => void;
}) {
  const keys =
    options.dialogNavigationKeys.length > 0
      ? options.dialogNavigationKeys
      : options.displayedKeys;
  const navigation = resolveDialogNavigationState(
    keys,
    options.currentEmojiKey,
  );
  if (options.emojiPrevious)
    options.emojiPrevious.disabled = navigation.previousDisabled;
  if (options.emojiNext) options.emojiNext.disabled = navigation.nextDisabled;
  options.updateCompositionBackButton();
}

export function updateCompositionBackButton(options: {
  byId: Record<string, any>;
  dialogParentPanel?: string;
  currentDialogParentStack?: string[];
  emojiByKey: Record<string, string>;
  emojiParent?: HTMLButtonElement;
  historyState: Record<string, unknown> | null | undefined;
  searchAnnotations: Record<string, string[]>;
  translate: (key: string, fallback: string) => string;
}) {
  if (!options.emojiParent) return;
  const parentKey = options.historyState?.compositionParent as
    string | undefined;
  const parentPanel =
    options.currentDialogParentStack?.at(-1) ??
    options.dialogParentPanel ??
    (options.historyState?.dialogParentPanel as string | undefined);
  const emojiParentAvailable = Boolean(
    parentKey && options.emojiByKey[parentKey],
  );
  const panelParentAvailable = Boolean(parentPanel);
  const available = emojiParentAvailable || panelParentAvailable;
  options.emojiParent.hidden = !available;
  if (!available) return;
  const label =
    emojiParentAvailable && parentKey
      ? resolveCompositionParentLabel({
          parentKey,
          searchAnnotations: options.searchAnnotations,
          byId: options.byId,
          translate: options.translate,
        })
      : parentPanel === "favorites"
        ? "Back to Favorites"
        : parentPanel === "help"
          ? "Back to Help"
          : parentPanel === "language"
            ? "Back to Language"
            : "Back";
  options.emojiParent.title = label;
  options.emojiParent.setAttribute("aria-label", label);
}
