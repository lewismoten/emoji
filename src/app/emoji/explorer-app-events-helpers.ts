import * as aria from "../../utils/aria.js";

type DatasetValue = Record<string, string | undefined>;
type DatasetTarget = { dataset?: DatasetValue };
type DocumentLike = {
  documentElement?: { dataset?: DatasetValue };
  addEventListener?: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void;
  querySelector?: <T>(selector: string) => T | null;
  querySelectorAll?: <T>(selector: string) => Iterable<T>;
};
type ChoiceLike = HTMLElement & DatasetTarget;
type DialogLike = {
  open?: boolean;
  querySelectorAll<T>(selector: string): Iterable<T>;
};

export const resolveOption = <T>(
  getter: (() => T) | undefined,
  fallback: T,
): T => getter?.() ?? fallback;

export const ensureDataset = (value: unknown) => {
  if (!value || typeof value !== "object") return undefined;
  const target = value as DatasetTarget;
  if (target.dataset) return target.dataset;
  target.dataset = {};
  return target.dataset;
};

export const getChoices = (
  documentRef: DocumentLike | undefined,
  selector: string,
) => Array.from(documentRef?.querySelectorAll?.<ChoiceLike>(selector) ?? []);

export const renderChoiceSelected =
  (datasetKey: string, selectedValue: string) => (choice: ChoiceLike) => {
    const selected = choice.dataset[datasetKey] === selectedValue;
    choice.classList.toggle("is-active", selected);
    aria.setPressed(choice, selected);
    aria.setChecked(choice, selected);
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    if (!input) return;
    input.checked = selected;
    input.defaultChecked = selected;
    if (selected) input.setAttribute("checked", "checked");
    else input.removeAttribute("checked");
  };

export const syncDialogChoiceGroup = (
  dialog: DialogLike | undefined | null,
  selector: string,
  datasetKey: string,
  selectedValue: string,
) => {
  if (!dialog) return;
  const choices = Array.from(dialog.querySelectorAll<ChoiceLike>(selector));
  choices.forEach(renderChoiceSelected(datasetKey, selectedValue));
};

export const bindChoiceEvents =
  (onKeyDown: (event: KeyboardEvent) => void, toggleCallback: () => void) =>
  (choice: ChoiceLike) => {
    if (choice.dataset.modeBound === "true") return;
    choice.dataset.modeBound = "true";
    choice.addEventListener("click", toggleCallback);
    choice.addEventListener("keydown", onKeyDown);
    choice
      .querySelector?.('input[type="radio"]')
      ?.addEventListener("change", toggleCallback);
  };

export const bindChoiceGroup = (
  documentRef: DocumentLike | undefined,
  selector: string,
  toggleCallback: () => void,
  createKeyDownHandler: (
    choices: ChoiceLike[],
  ) => (event: KeyboardEvent) => void,
) => {
  const choices = getChoices(documentRef, selector);
  if (choices.length === 0) return;
  const onKeyDown = createKeyDownHandler(choices);
  choices.forEach(bindChoiceEvents(onKeyDown, toggleCallback));
};

export const resolveLanguagePickerButton = (
  languagePicker:
    HTMLElement | (() => HTMLElement | null | undefined) | null | undefined,
  documentRef: DocumentLike | undefined,
) =>
  (typeof languagePicker === "function" ? languagePicker() : languagePicker) ??
  documentRef?.querySelector?.<HTMLElement>(".language-picker");

export const ensurePanelBound = (button: HTMLElement) => {
  const dataset =
    "dataset" in button && button.dataset
      ? button.dataset
      : ((button as HTMLElement & DatasetTarget).dataset = {});
  if (dataset.panelBound === "true") return false;
  dataset.panelBound = "true";
  return true;
};

export const createLanguageBeforeOpen = (
  getHelpDialog: () => DialogLike | undefined | null,
  getLanguageDialog: () => (HTMLElement & DatasetTarget) | undefined | null,
  closePanel: (dialog: unknown, suppressed: unknown) => void,
  suppressedPanelCloses: unknown,
) => {
  return () => {
    const helpDialog = getHelpDialog();
    const languageDialog = getLanguageDialog();
    if (helpDialog?.open) {
      if (languageDialog) ensureDataset(languageDialog)!.returnPanel = "help";
      closePanel(helpDialog, suppressedPanelCloses);
      return;
    }
    if (!languageDialog) return;
    delete ensureDataset(languageDialog)?.returnPanel;
  };
};

export const createHelpAfterOpen = (
  windowRef: Pick<Window, "requestAnimationFrame" | "setTimeout"> | undefined,
  documentRef: DocumentLike | undefined,
  dependencies: {
    audioToggle: { render(): void };
    themes: { getTheme(): string };
  },
  options: {
    refreshElements?: () => void;
    renderDeveloperMode?: () => void;
    renderThemeToggle?: () => void;
  },
  getHelpDialog: () => DialogLike | undefined | null,
) => {
  return async () => {
    if (windowRef) {
      await new Promise<void>((resolve) =>
        typeof windowRef.requestAnimationFrame === "function"
          ? windowRef.requestAnimationFrame(() => resolve())
          : windowRef.setTimeout(resolve, 0),
      );
    }
    options.refreshElements?.();
    options.renderDeveloperMode?.();
    options.renderThemeToggle?.();
    dependencies.audioToggle.render();
    const helpDialog = getHelpDialog();
    syncDialogChoiceGroup(
      helpDialog,
      ".theme-choice",
      "theme",
      dependencies.themes.getTheme(),
    );
    syncDialogChoiceGroup(
      helpDialog,
      ".mode-choice",
      "mode",
      documentRef?.documentElement?.dataset?.explorerMode ?? "standard",
    );
  };
};

export const bindSavedDialogInteractionsIfUnbound = (
  dialog: unknown,
  options: any,
  bindSavedDialogInteractions: (options: unknown) => void,
) => {
  const dialogDataset = dialog ? ensureDataset(dialog) : undefined;
  if (!dialog || dialogDataset?.savedDialogBound === "true") return false;
  if (dialogDataset) dialogDataset.savedDialogBound = "true";
  bindSavedDialogInteractions({ ...options, savedDialog: dialog });
  return true;
};

export const bindSavedDialogInteractionsIfPresent = (
  dialog: unknown,
  options: any,
  bindSavedDialogInteractions: (options: unknown) => void,
) => {
  if (!dialog) return false;
  const savedDialogDataset = ensureDataset(dialog);
  bindSavedDialogInteractions({ ...options, savedDialog: dialog });
  if (savedDialogDataset) savedDialogDataset.savedDialogBound = "true";
  return true;
};

export const bindInstallDialogClose = (
  installDialog:
    | {
        close?: () => void;
        querySelector?: (selector: string) => unknown;
      }
    | undefined,
  bindClick: (target: any, handler: () => void) => () => void,
) =>
  bindClick(installDialog?.querySelector?.(".install-dialog-close"), () =>
    installDialog?.close?.(),
  );

export const bindDeveloperModeToggleIfNeeded = (
  modeChoices: unknown[] | undefined,
  developerModeToggle: unknown,
  toggleDeveloperMode: () => void,
  bindChange: (target: any, handler: () => void) => () => void,
) =>
  modeChoices?.length
    ? () => {}
    : bindChange(developerModeToggle, toggleDeveloperMode);
