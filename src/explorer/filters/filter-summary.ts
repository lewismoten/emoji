import { displayUnicodeSubGroupName } from "./filter-picker.js";

type CheckboxLike = {
  checked: boolean;
  value: string;
  closest: (selector: string) => HTMLElement | null;
};

function appendSeparator(fragment: DocumentFragment) {
  if (!fragment.hasChildNodes()) return;
  fragment.append(document.createTextNode(" · "));
}

function appendTextPart(fragment: DocumentFragment, text: string) {
  if (!text) return;
  appendSeparator(fragment);
  fragment.append(document.createTextNode(text));
}

function appendModifierPart(
  fragment: DocumentFragment,
  checkbox: CheckboxLike,
) {
  const label = checkbox.closest("label");
  const emoji = label?.querySelector<HTMLElement>(".modifier-emoji");
  if (!emoji) {
    appendTextPart(fragment, checkbox.value);
    return;
  }
  appendSeparator(fragment);
  fragment.append(emoji.cloneNode(true));
}

export function updateActiveFilterSummary(options: {
  activeFilterSummary?: HTMLElement;
  activeFilterText?: HTMLElement;
  displayUnicodeSubGroupName?: (name: string) => string;
  displayGroupName: (name: string) => string;
  genderCheckboxes: CheckboxLike[];
  hairCheckboxes: CheckboxLike[];
  latestReleased?: string;
  orderMode: string;
  searchText: string;
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  skinToneCheckboxes: CheckboxLike[];
  translate: (key: string, fallback: string) => string;
  versionMode: string;
  versionSliderLabel: (version: string) => string;
  versionValue: string;
}) {
  if (!options.activeFilterSummary || !options.activeFilterText) return;
  const fragment = document.createDocumentFragment();

  if (options.searchText.trim()) {
    appendTextPart(fragment, `“${options.searchText.trim()}”`);
  }

  if (options.orderMode === "sequence" && options.selectedSequenceType) {
    appendTextPart(
      fragment,
      options.translate(
        options.sequenceTranslationKeys[options.selectedSequenceType] ??
          options.selectedSequenceType,
        options.sequenceTypeLabels[options.selectedSequenceType] ??
          options.selectedSequenceType,
      ),
    );
  } else {
    if (options.selectedGroup) {
      appendTextPart(fragment, options.displayGroupName(options.selectedGroup));
    }
    if (options.selectedSubGroup) {
      appendTextPart(
        fragment,
        options.displayUnicodeSubGroupName?.(
          options.selectedSubGroup.split("::").slice(1).join("::"),
        ) ??
          displayUnicodeSubGroupName(
            options.selectedSubGroup.split("::").slice(1).join("::"),
          ) ??
          options.selectedSubGroup,
      );
    }
  }

  if (
    options.versionValue &&
    (options.versionValue !== options.latestReleased ||
      options.versionMode === "selected")
  ) {
    const mode =
      options.versionMode === "selected"
        ? options.translate("onlyVersion", "Only")
        : options.translate("throughVersion", "Through");
    appendTextPart(
      fragment,
      `${mode} ${options.versionSliderLabel(options.versionValue)}`,
    );
  }

  for (const checkbox of [
    ...options.skinToneCheckboxes,
    ...options.hairCheckboxes,
    ...options.genderCheckboxes,
  ].filter((item) => item.checked)) {
    appendModifierPart(fragment, checkbox);
  }

  options.activeFilterSummary.hidden = !fragment.hasChildNodes();
  options.activeFilterText.replaceChildren(fragment);
}
