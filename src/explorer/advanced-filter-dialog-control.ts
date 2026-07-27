import { AdvancedFiltersTriggerControl } from "../controls/advanced-filters-trigger.js";
import { GenderFilterControl } from "../controls/gender-filter.js";
import { createDialogHeading } from "./dialog-control-helpers.js";

function createModifierOption(options: {
  className: string;
  value: string;
  emoji: string;
  labelKey: string;
  label: string;
}) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = options.className;
  input.value = options.value;
  const emoji = document.createElement("span");
  emoji.className = "modifier-emoji";
  emoji.textContent = options.emoji;
  const text = document.createElement("span");
  text.className = "modifier-label";
  text.dataset.i18n = options.labelKey;
  text.textContent = options.label;
  label.append(input, emoji, text);
  return label;
}

function createModifierFieldset(options: {
  legendKey: string;
  legend: string;
  items: Array<{
    className: string;
    value: string;
    emoji: string;
    labelKey: string;
    label: string;
  }>;
}) {
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.dataset.i18n = options.legendKey;
  legend.textContent = options.legend;
  fieldset.append(legend, ...options.items.map(createModifierOption));
  return fieldset;
}

function createSequenceFilterField() {
  const field = document.createElement("div");
  field.className = "filter-field sequence-filter-field has-choice-buttons";
  field.hidden = true;
  const heading = document.createElement("div");
  heading.className = "filter-heading";
  const label = document.createElement("span");
  label.id = "sequence-filter-label";
  label.dataset.i18n = "sequenceType";
  label.textContent = "Sequence type";
  const value = document.createElement("span");
  value.className = "compact-sequence-label";
  heading.append(label, value);
  const select = document.createElement("select");
  select.className = "select-sequence-type";
  select.setAttribute("aria-labelledby", "sequence-filter-label");
  const option = document.createElement("option");
  option.textContent = "Not loaded";
  select.append(option);
  const choices = document.createElement("div");
  choices.className = "compact-choices compact-sequence-choices";
  choices.setAttribute("role", "radiogroup");
  choices.setAttribute("aria-labelledby", "sequence-filter-label");
  field.append(heading, select, choices);
  return field;
}

export function createAdvancedFiltersTriggerControl() {
  return AdvancedFiltersTriggerControl.create();
}

export function createAdvancedFiltersDialogControl() {
  const dialog = document.createElement("dialog");
  dialog.className = "advanced-filters-dialog";
  dialog.id = "advanced-filters-dialog";
  dialog.setAttribute("aria-labelledby", "advanced-filters-dialog-title");
  dialog.append(
    createDialogHeading({
      titleId: "advanced-filters-dialog-title",
      titleKey: "advancedFilters",
      title: "Advanced filters",
    }),
  );
  const body = document.createElement("div");
  body.className = "advanced-filters-dialog-body";
  const grid = document.createElement("div");
  grid.className = "filter-grid";
  grid.append(createSequenceFilterField());
  const modifiers = document.createElement("div");
  modifiers.className = "modifier-filters";
  modifiers.append(
    GenderFilterControl.create(),
    createModifierFieldset({
      legendKey: "skinTone",
      legend: "Skin tone",
      items: [
        {
          className: "skin-tone",
          value: "1F3FF",
          emoji: "🏿",
          labelKey: "dark",
          label: "Dark",
        },
        {
          className: "skin-tone",
          value: "1F3FE",
          emoji: "🏾",
          labelKey: "mediumDark",
          label: "Medium-dark",
        },
        {
          className: "skin-tone",
          value: "1F3FD",
          emoji: "🏽",
          labelKey: "medium",
          label: "Medium",
        },
        {
          className: "skin-tone",
          value: "1F3FC",
          emoji: "🏼",
          labelKey: "mediumLight",
          label: "Medium-light",
        },
        {
          className: "skin-tone",
          value: "1F3FB",
          emoji: "🏻",
          labelKey: "light",
          label: "Light",
        },
      ],
    }),
    createModifierFieldset({
      legendKey: "hair",
      legend: "Hair",
      items: [
        {
          className: "hair",
          value: "1F9B0",
          emoji: "🧑‍🦰",
          labelKey: "red",
          label: "Red",
        },
        {
          className: "hair",
          value: "1F9B1",
          emoji: "🧑‍🦱",
          labelKey: "curly",
          label: "Curly",
        },
        {
          className: "hair",
          value: "1F9B2",
          emoji: "🧑‍🦲",
          labelKey: "bald",
          label: "Bald",
        },
        {
          className: "hair",
          value: "1F9B3",
          emoji: "🧑‍🦳",
          labelKey: "white",
          label: "White",
        },
      ],
    }),
  );
  body.append(grid, modifiers);
  dialog.append(body);
  return { dialog, body, grid, modifiers };
}

export function ensureAdvancedFilterControls() {
  const filterOptions = document.querySelector(".filter-options");
  if (
    filterOptions &&
    !filterOptions.querySelector(".advanced-filters-trigger")
  ) {
    filterOptions.prepend(createAdvancedFiltersTriggerControl());
  }
  const main = document.querySelector("main");
  if (main && !document.querySelector(".advanced-filters-dialog")) {
    main.append(createAdvancedFiltersDialogControl().dialog);
  }
}
