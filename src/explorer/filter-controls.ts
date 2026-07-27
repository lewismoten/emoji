import type { ExplorerUrlState } from "./url-state.js";

type SearchInputLike = {
  value: string;
};

type SelectOptionLike = {
  value: string;
};

type SelectLike = {
  value: string;
  options: ArrayLike<SelectOptionLike>;
};

type InputLike = {
  checked: boolean;
  value: string;
};

type OrderButtonLike = {
  dataset: Record<string, string | undefined>;
  classList: { toggle(name: string, force?: boolean): void };
  setAttribute(name: string, value: string): void;
};

export function applyBasicUrlStateToControls(options: {
  state: ExplorerUrlState;
  searchText: SearchInputLike;
  orderButtons: OrderButtonLike[];
}) {
  options.searchText.value = options.state.search;
  options.orderButtons.forEach((button) => {
    const active = button.dataset.order === options.state.order;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  return {
    orderMode: options.state.order,
    selectedSequenceType: options.state.sequenceType,
    compositionMode: options.state.compositionMode,
  };
}

export function applyLoadedUrlStateToControls(options: {
  state: ExplorerUrlState;
  versionSelector: SelectLike;
  versionModeSelector: SelectLike;
  groups: string[];
  subGroups: Record<string, string[]>;
  skinToneCheckboxes: InputLike[];
  hairCheckboxes: InputLike[];
  genderCheckboxes: InputLike[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
}) {
  if (
    options.state.version &&
    Array.from(options.versionSelector.options).some(
      (option) => option.value === options.state.version,
    )
  ) {
    options.versionSelector.value = options.state.version;
  }
  options.versionModeSelector.value = options.state.versionMode;
  const selectedGroup = options.groups.includes(options.state.group)
    ? options.state.group
    : "";
  const selectedSubGroup =
    selectedGroup &&
    options.subGroups[selectedGroup]?.includes(options.state.subGroup)
      ? options.subGroupSelectionKey(selectedGroup, options.state.subGroup)
      : "";
  options.skinToneCheckboxes.forEach((checkbox) => {
    checkbox.checked = options.state.skin.includes(checkbox.value);
  });
  options.hairCheckboxes.forEach((checkbox) => {
    checkbox.checked = options.state.hair.includes(checkbox.value);
  });
  const selectedGender = options.state.gender.find((value) =>
    options.genderCheckboxes.some((checkbox) => checkbox.value === value),
  );
  options.genderCheckboxes.forEach((checkbox) => {
    checkbox.checked = checkbox.value === selectedGender;
  });
  return {
    selectedGroup,
    selectedSubGroup,
  };
}

export function resetFilterControls(options: {
  searchText: SearchInputLike;
  versionModeSelector: SelectLike;
  versionSelector: SelectLike;
  latestReleasedVersion?: string;
  skinToneCheckboxes: InputLike[];
  hairCheckboxes: InputLike[];
  genderCheckboxes: InputLike[];
}) {
  options.searchText.value = "";
  options.versionModeSelector.value = "through";
  if (options.latestReleasedVersion) {
    options.versionSelector.value = options.latestReleasedVersion;
  }
  options.skinToneCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  options.hairCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  options.genderCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}

export function applyExclusiveCheckboxSelection(
  checkboxes: InputLike[],
  currentTarget: InputLike,
) {
  if (!currentTarget.checked) return;
  checkboxes.forEach((checkbox) => {
    if (checkbox !== currentTarget) checkbox.checked = false;
  });
}

export function stepVersionIndex(
  currentIndex: number,
  optionCount: number,
  amount: number,
) {
  return Math.max(0, Math.min(optionCount - 1, currentIndex + amount));
}

export function createFilterControlSetup(options: {
  document: any;
  versionModeSelector: any;
  versionRange: () => any;
  versionSelector: any;
}) {
  const { document, versionModeSelector, versionSelector } = options;

  function ensureActiveFilterSummary() {
    let summary = document.getElementsByClassName("active-filter-summary")[0];
    if (!summary) {
      summary = document.createElement("div");
      summary.className = "active-filter-summary";
      summary.hidden = true;
      const text = document.createElement("span");
      text.className = "active-filter-text";
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "clear-filters";
      clear.dataset.i18n = "clearAll";
      clear.textContent = "Clear all";
      summary.append(text, clear);
      document
        .getElementsByClassName("filter-options")[0]
        ?.appendChild(summary);
    }
    summary.removeAttribute("role");
    summary.removeAttribute("aria-live");
    return {
      summary,
      text: summary.querySelector(".active-filter-text"),
      clear: summary.querySelector(".clear-filters"),
    };
  }

  function ensureSequenceTypeFilter() {
    const existing = document.getElementsByClassName("select-sequence-type")[0];
    if (existing) return existing;
    const field = document.createElement("div");
    field.className = "filter-field sequence-filter-field";
    field.hidden = true;
    field.innerHTML = `
      <div class="filter-heading">
        <span id="sequence-filter-label" data-i18n="sequenceType">Sequence type</span>
        <span class="compact-sequence-label"></span>
      </div>
      <select class="select-sequence-type" aria-labelledby="sequence-filter-label"><option>Not loaded</option></select>
      <div class="compact-choices compact-sequence-choices" role="radiogroup" aria-labelledby="sequence-filter-label"></div>
    `;
    document.querySelector(".filter-grid .version-field")?.before(field);
    return field.querySelector(".select-sequence-type");
  }

  function ensureChoiceContainer(
    selector: any,
    className: string,
    labelId: string,
  ) {
    const existing = document.getElementsByClassName(className)[0];
    if (existing) return existing;
    let field = selector.closest(".filter-field");
    if (field?.tagName === "LABEL") {
      const replacement = document.createElement("div");
      replacement.className = field.className;
      replacement.append(...field.childNodes);
      field.replaceWith(replacement);
      field = replacement;
    }
    const label = field?.querySelector("span");
    if (label && !label.id) label.id = labelId;
    selector.setAttribute("aria-labelledby", label?.id || labelId);
    const choices = document.createElement("div");
    choices.className = `compact-choices ${className}`;
    choices.setAttribute("role", "radiogroup");
    choices.setAttribute("aria-labelledby", label?.id || labelId);
    field?.appendChild(choices);
    return choices;
  }

  function ensureSelectionLabel(
    selector: any,
    className: string,
    labelId: string,
  ) {
    const existing = document.getElementsByClassName(className)[0];
    if (existing) return existing;
    const field = selector.closest(".filter-field");
    const label =
      document.getElementById(labelId) ?? field?.querySelector("span");
    if (!field || !label) return undefined;
    let heading = label.closest(".filter-heading");
    if (!heading) {
      heading = document.createElement("div");
      heading.className = "filter-heading";
      label.before(heading);
      heading.appendChild(label);
    }
    const selection = document.createElement("span");
    selection.className = className;
    heading.appendChild(selection);
    return selection;
  }

  function ensureVersionSlider() {
    const existingRange = document.getElementsByClassName("version-range")[0];
    const existingOutput = document.getElementsByClassName(
      "version-range-value",
    )[0];
    const existingField = existingRange?.closest(".version-field");
    existingField?.classList.add("developer-only");
    if (existingRange && existingOutput)
      return { range: existingRange, output: existingOutput };
    let field = versionSelector.closest(".filter-field");
    field?.classList.add("developer-only");
    if (field?.tagName === "LABEL") {
      const replacement = document.createElement("div");
      replacement.className = `${field.className} version-field`;
      replacement.append(...field.childNodes);
      field.replaceWith(replacement);
      field = replacement;
    }
    const label = field?.querySelector("span");
    if (label && !label.id) label.id = "version-filter-label";
    versionSelector.setAttribute(
      "aria-labelledby",
      label?.id || "version-filter-label",
    );
    const wrapper = document.createElement("div");
    wrapper.className = "compact-version";
    const range = document.createElement("input");
    range.id = "version-range";
    range.className = "version-range";
    range.type = "range";
    range.min = "0";
    range.max = "0";
    range.step = "1";
    range.value = "0";
    range.disabled = true;
    range.setAttribute("aria-labelledby", label?.id || "version-filter-label");
    range.setAttribute("aria-describedby", "version-range-value");
    const output = document.createElement("output");
    output.id = "version-range-value";
    output.className = "version-range-value";
    output.setAttribute("for", "version-range");
    output.setAttribute("aria-live", "polite");
    output.value = "—";
    wrapper.append(range, output);
    field?.appendChild(wrapper);
    return { range, output };
  }

  function ensureVersionModeToggle() {
    const versionField = versionSelector.closest(".filter-field");
    const oldModeField = versionModeSelector.closest(".filter-field");
    if (oldModeField && oldModeField !== versionField)
      oldModeField.hidden = true;
    versionModeSelector.hidden = true;
    const existing = document.getElementsByClassName("version-mode-toggle")[0];
    if (existing) return existing;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "version-mode-toggle";
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "🎯";
    button.appendChild(icon);
    options.versionRange()?.closest(".compact-version")?.prepend(button);
    return button;
  }

  return {
    ensureActiveFilterSummary,
    ensureChoiceContainer,
    ensureSelectionLabel,
    ensureSequenceTypeFilter,
    ensureVersionModeToggle,
    ensureVersionSlider,
  };
}
