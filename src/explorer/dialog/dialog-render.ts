import { resolveEmojiDialogDisplay } from "./dialog-state.js";
import { renderEmojiComposition } from "../emoji/emoji-composition.js";
import { resolveRenderingDiagnostic } from "../emoji/rendering-diagnostic.js";

export function updateEmojiComposition(options: {
  applyPixelArtworkClass: (element: any, emojiKey: string) => void;
  applyStandalonePixelArtwork: (element: any, emojiKey?: string) => void;
  byId: Record<string, any>;
  developerMode: boolean;
  detailsVisible: boolean;
  dir: string;
  emojiByKey: Record<string, string>;
  emojiKeyByCodePoints: Map<string, string>;
  exampleDialog: HTMLElement;
  item: any;
  locale?: string;
  numberingSystem?: string;
  searchAnnotations: Record<string, string[]>;
  translate: (key: string, fallback: string) => string;
  value: string;
  compositionMode: "condensed" | "full";
}) {
  const section = options.exampleDialog.querySelector(".emoji-composition");
  const equation = section?.querySelector(".emoji-composition-equation");
  const modeButton = section?.querySelector(".emoji-composition-mode");
  renderEmojiComposition({
    section: section as any,
    equation: equation as any,
    modeButton: modeButton as any,
    item: options.item,
    value: options.value,
    developerMode: options.developerMode,
    detailsVisible: options.detailsVisible,
    compositionMode: options.compositionMode,
    emojiKeyByCodePoints: options.emojiKeyByCodePoints,
    emojiByKey: options.emojiByKey,
    searchAnnotations: options.searchAnnotations,
    byId: options.byId,
    translate: options.translate,
    applyPixelArtworkClass: options.applyPixelArtworkClass,
    applyStandalonePixelArtwork: options.applyStandalonePixelArtwork,
    dir: options.dir,
    locale: options.locale,
    numberingSystem: options.numberingSystem,
  });
}

export function updateRenderingDiagnostic(options: {
  developerMode: boolean;
  fullDeveloperMode?: boolean;
  detailsVisible: boolean;
  emojiKey: string;
  emojiValue: string;
  exampleDialog: HTMLElement;
  painted: boolean;
  privateUsePoint?: number;
  systemEmojiAppearsSplit: (value: string) => boolean;
  translate: (key: string, fallback: string) => string;
  byId: Record<string, any>;
}) {
  const section = options.exampleDialog.querySelector(".rendering-diagnostic");
  const invitation = options.exampleDialog.querySelector(
    ".pixel-design-invitation",
  );
  const regularEditorButton = options.exampleDialog.querySelector(
    ".emoji-copy-actions .show-pixel-editor",
  ) as HTMLElement | null;
  if (!section || !invitation) return;
  const diagnostic = resolveRenderingDiagnostic({
    codePoints: options.byId[options.emojiKey]?.codePoints,
    emojiValue: options.emojiValue,
    painted: options.painted,
    privateUsePoint: options.privateUsePoint,
    developerMode: options.fullDeveloperMode ?? options.developerMode,
    detailsVisible: options.detailsVisible,
    systemEmojiAppearsSplit: options.systemEmojiAppearsSplit,
    translate: options.translate,
  });
  (section as HTMLElement).dataset.available = String(
    diagnostic.sectionAvailable,
  );
  (invitation as HTMLElement).dataset.available = String(
    diagnostic.invitationAvailable,
  );
  (section as HTMLElement).hidden = diagnostic.sectionHidden;
  (invitation as HTMLElement).hidden = diagnostic.invitationHidden;
  if (regularEditorButton)
    regularEditorButton.hidden = diagnostic.regularEditorHidden;
  if (!options.painted || !options.privateUsePoint) return;

  const systemGlyph = section.querySelector(".system-render-glyph");
  const pixelGlyph = section.querySelector(".pixel-render-glyph");
  const result = section.querySelector(".rendering-result");
  if (!systemGlyph || !pixelGlyph || !result) return;
  systemGlyph.textContent = options.emojiValue;
  pixelGlyph.textContent = String.fromCodePoint(options.privateUsePoint);
  (section as HTMLElement).dataset.pixelEmojiKey = options.emojiKey;
  result.classList.toggle("is-warning", diagnostic.split);
  result.textContent = diagnostic.resultText;
}

export function renderEmojiDialog(options: {
  annotations: string[];
  applyPixelArtworkClass: (element: Element | null, emojiKey: string) => void;
  applyStandalonePixelArtwork: (
    element: Element | null,
    emojiKey: string,
  ) => void;
  byId: Record<string, any>;
  compositionMode: string;
  currentEmojiKey: string;
  developerMode: boolean;
  fullDeveloperMode?: boolean;
  dialogNavigationKeys: string[];
  displayGroupName: (name: string) => string;
  displayUnicodeSubGroupName: (name: string) => string;
  emojiByKey: Record<string, string>;
  exampleDialog: HTMLDialogElement;
  getIntroducedVersion: (key: string) => string;
  group: string;
  id: string;
  item: any;
  locale?: string;
  numberingSystem?: string;
  searchAnnotations: Record<string, string[]>;
  selectedSearchLocale: string;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  statusTranslationKeys: Record<string, string>;
  subGroup: string;
  translate: (key: string, fallback: string) => string;
  updateFavoriteButton: () => void;
  updateRenderingDiagnostic: (
    emojiKey: string,
    value: string,
    fullDeveloperMode?: boolean,
  ) => void;
  updateEmojiComposition: (item: any, value: string) => void;
  value: string;
}) {
  const dialogDisplay = resolveEmojiDialogDisplay({
    emojiKey: options.id,
    emojiValue: options.value,
    item: options.item,
    groupText: options.displayGroupName(options.group),
    subGroupText: options.displayUnicodeSubGroupName(options.subGroup),
    introducedVersion: options.getIntroducedVersion(options.id),
    selectedSearchLocale: options.selectedSearchLocale,
    annotations: options.annotations,
    sequenceTypeLabels: options.sequenceTypeLabels,
    sequenceTranslationKeys: options.sequenceTranslationKeys,
    statusTranslationKeys: options.statusTranslationKeys,
    translate: options.translate,
  });

  (document.getElementsByClassName("emoji-group")[0] as HTMLElement).innerText =
    dialogDisplay.groupText;
  (
    document.getElementsByClassName("emoji-subgroup")[0] as HTMLElement
  ).innerText = dialogDisplay.subGroupText;
  (document.getElementsByClassName("emoji-key")[0] as HTMLElement).innerText =
    dialogDisplay.keyText;
  (document.getElementsByClassName("emoji-value")[0] as HTMLElement).innerText =
    dialogDisplay.valueText;
  (
    document.getElementsByClassName("emoji-encoded")[0] as HTMLElement
  ).innerText = dialogDisplay.encodedText;
  const previewGlyph = document.getElementsByClassName(
    "emoji-preview-glyph",
  )[0] as HTMLElement;
  previewGlyph.innerText = options.value;
  options.applyPixelArtworkClass(previewGlyph, options.id);
  options.updateRenderingDiagnostic(
    options.id,
    options.value,
    options.fullDeveloperMode ?? options.developerMode,
  );
  options.updateEmojiComposition(options.item, options.value);
  const englishNameElement = document.getElementsByClassName(
    "emoji-english-name",
  )[0] as HTMLElement;
  englishNameElement.innerText = dialogDisplay.englishName;
  (
    document.getElementsByClassName("emoji-version")[0] as HTMLElement
  ).innerText = dialogDisplay.versionText;
  (
    document.getElementsByClassName("emoji-sequence-type")[0] as HTMLElement
  ).innerText = dialogDisplay.sequenceTypeText;
  (
    document.getElementsByClassName("emoji-status")[0] as HTMLElement
  ).innerText = dialogDisplay.statusText;

  const localizedDetails = document.getElementsByClassName(
    "localized-emoji-details",
  )[0] as HTMLElement;
  const dialogTitleElement = document.getElementById(
    "example-title",
  ) as HTMLElement;
  dialogTitleElement.innerText = dialogDisplay.dialogTitle.title;
  if (dialogDisplay.dialogTitle.showLocalized) {
    (
      document.getElementsByClassName("localized-language")[0] as HTMLElement
    ).innerText = options.translate("keywords", "keywords");
    (
      document.getElementsByClassName("localized-keywords")[0] as HTMLElement
    ).innerText = dialogDisplay.dialogTitle.localizedKeywords;
    localizedDetails.hidden = false;
  } else {
    localizedDetails.hidden = true;
  }
  dialogTitleElement.title = dialogDisplay.dialogTitle.title;
  (
    englishNameElement.closest(".emoji-english-name-row, div") as HTMLElement
  ).hidden = dialogDisplay.hideEnglishName;
  options.updateFavoriteButton();
  return dialogDisplay;
}
