import { AdvancedFiltersTriggerControl } from "../controls/filters/advanced-filters-trigger.js";
import { GenderFilterControl } from "../controls/filters/gender-filter.js";
import { HairFilterControl } from "../controls/filters/hair-filter.js";
import { SkinToneFilterControl } from "../controls/filters/skin-tone-filter.js";
import { createDialogHeading } from "./dialog-control-helpers.js";

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
    SkinToneFilterControl.create(),
    HairFilterControl.create(),
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
