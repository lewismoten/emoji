import {
  createLanguageDialogControl,
  createLanguagePickerControl,
} from "../language/language-dialog-control.js";
import { EmojiFontChoiceGroupControl } from "../../controls/toolbar/emoji-font-choice-group.js";
import {
  ensureDialogTitleRow,
  ensureFavoriteButton,
  positionFavoriteButton as positionFavoriteButtonHelper,
} from "../dialog/parts/dialog-title-controls.js";
import { createHelpDialogControl } from "../toolbar/help-settings-control.js";
import {
  createAdvancedFiltersDialogControl,
  createAdvancedFiltersTriggerControl,
} from "../filters/advanced-filter-dialog-control.js";
import {
  createHelpPickerControl,
  createSavedPickerControl,
} from "../toolbar/toolbar-trigger-controls.js";
import { ensurePickerControls } from "./utility-picker-controls.js";

type MinimalElement = {
  after(...nodes: unknown[]): void;
  append(...nodes: unknown[]): void;
  before(...nodes: unknown[]): void;
  childNodes: unknown[];
  className: string;
  closest?(selector: string): MinimalElement | null;
  dataset: Record<string, string | undefined>;
  innerHTML: string;
  insertAdjacentHTML(position: InsertPosition, text: string): void;
  prepend(...nodes: unknown[]): void;
  querySelector(selector: string): MinimalElement | null;
  remove(): void;
  replaceWith(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  checked?: boolean;
  hidden?: boolean;
  name?: string;
  tabIndex?: number;
  textContent: string | null;
  title?: string;
  type?: string;
  value?: string;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
  querySelector(selector: string): MinimalElement | null;
};

type InsertPosition = "beforebegin" | "afterbegin" | "beforeend" | "afterend";

declare const window: {
  matchMedia(query: string): { matches: boolean };
};

export function positionFavoriteButton() {
  const favoriteButton = document.querySelector(
    ".example-dialog .toggle-favorite",
  );
  const dialogTitleRow = document.querySelector(
    ".example-dialog .dialog-title-row",
  );
  const dialogControls = document.querySelector(
    ".example-dialog .dialog-controls",
  );
  positionFavoriteButtonHelper({
    compact: window.matchMedia("(max-width: 560px)").matches,
    dialogControls: dialogControls as unknown as HTMLElement | null,
    dialogTitleRow: dialogTitleRow as unknown as HTMLElement | null,
    favoriteButton: favoriteButton as unknown as HTMLElement | null,
  });
}

export function ensureUtilityControls() {
  const searchControls = document.querySelector(".search-controls");
  const fontComparison = document.querySelector(".pixel-comparison");
  if (fontComparison && !fontComparison.querySelector(".emoji-font-choice")) {
    const replacement = EmojiFontChoiceGroupControl.create() as unknown as MinimalElement;
    fontComparison.className = replacement.className;
    fontComparison.dataset.i18nAriaLabel = replacement.dataset.i18nAriaLabel;
    fontComparison.setAttribute("role", "radiogroup");
    fontComparison.setAttribute("aria-label", "Emoji style");
    if ("childNodes" in fontComparison) {
      fontComparison.innerHTML = "";
      if (Array.isArray(fontComparison.childNodes)) {
        fontComparison.childNodes.length = 0;
      }
      fontComparison.append(...replacement.childNodes);
    }
  }
  if (searchControls && !searchControls.querySelector(".saved-picker")) {
    searchControls.append(createSavedPickerControl() as unknown as MinimalElement);
  }
  searchControls?.querySelector(".pixel-font-toggle")?.remove();
  if (searchControls && !searchControls.querySelector(".help-picker")) {
    searchControls.append(createHelpPickerControl() as unknown as MinimalElement);
  }
  ensurePickerControls();
  const filterOptions = document.querySelector(".filter-options");
  if (
    filterOptions &&
    !filterOptions.querySelector(".advanced-filters-trigger")
  ) {
    filterOptions.prepend(
      createAdvancedFiltersTriggerControl() as unknown as MinimalElement,
    );
  }

  const dialogTitle = document.querySelector(
    ".example-dialog .dialog-heading > div:first-child",
  );
  const dialogControls = document.querySelector(
    ".example-dialog .dialog-controls",
  );
  const dialogTitleRow = ensureDialogTitleRow(
    dialogTitle as unknown as HTMLElement | null,
  );
  const favoriteButton = ensureFavoriteButton(
    dialogControls as unknown as HTMLElement | null,
  );
  if (dialogControls && favoriteButton) {
    positionFavoriteButton();
  }
}

const utilityPanelPromises = new Map<string, Promise<void>>();

function rememberUtilityPanel(key: string, task: () => Promise<void>) {
  const existing = utilityPanelPromises.get(key);
  if (existing) return existing;
  const pending = task().finally(() => {
    utilityPanelPromises.delete(key);
  });
  utilityPanelPromises.set(key, pending);
  return pending;
}

export async function ensureEmojiCompositionControl() {
  if (document.querySelector(".example-dialog .emoji-composition")) return;
  await rememberUtilityPanel("emoji-composition", async () => {
    const dialogDetails = document.querySelector(
      ".example-dialog .emoji-dialog-details",
    );
    if (
      !dialogDetails ||
      document.querySelector(".example-dialog .emoji-composition")
    )
      return;
    const { EmojiCompositionSectionControl } = await import(
      "../../controls/dialog/content/emoji-composition-section.js"
    );
    dialogDetails.after(
      EmojiCompositionSectionControl.create() as unknown as MinimalElement,
    );
  });
}

export async function ensureUtilityPanel(panel: string) {
  const main = document.querySelector("main");
  if (!main) return;
  if (panel === "favorites") {
    await rememberUtilityPanel("favorites", async () => {
      if (document.querySelector(".saved-dialog")) return;
      const { SavedDialogControl } = await import(
        "../../controls/dialog/content/saved-dialog.js"
      );
      main.append(SavedDialogControl.create() as unknown as MinimalElement);
    });
    return;
  }
  if (panel === "language") {
    await rememberUtilityPanel("language", async () => {
      if (document.querySelector(".language-dialog")) return;
      const languageDialogControl = await createLanguageDialogControl();
      main.append(languageDialogControl.dialog);
    });
    return;
  }
  if (panel === "help") {
    await rememberUtilityPanel("help", async () => {
      let helpDialogControl:
        | Awaited<ReturnType<typeof createHelpDialogControl>>
        | undefined;
      if (!document.querySelector(".help-dialog")) {
        helpDialogControl = await createHelpDialogControl();
        main.append(helpDialogControl.element);
      }
      let languagePicker = document.querySelector(".language-picker");
      if (!languagePicker) {
        const languagePickerControl = await createLanguagePickerControl();
        languagePicker = languagePickerControl.button as unknown as MinimalElement;
      }
      if (helpDialogControl && languagePicker) {
        helpDialogControl.mountLanguagePicker(
          languagePicker as unknown as HTMLElement,
        );
      } else {
        const helpLanguageControl = document.querySelector(
          ".help-dialog .help-language-control",
        );
        if (helpLanguageControl && languagePicker) {
          helpLanguageControl.append(languagePicker);
        }
      }
    });
    return;
  }
  if (panel === "filters") {
    await rememberUtilityPanel("filters", async () => {
      if (document.querySelector(".advanced-filters-dialog")) return;
      const control = await createAdvancedFiltersDialogControl();
      main.append(control.dialog);
    });
  }
}
