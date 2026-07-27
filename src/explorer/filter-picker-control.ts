import {
  createDialogHeading,
  setPressedState,
} from "./dialog-control-helpers.js";
import { CompactChoiceButtonControl } from "../controls/filters/pickers/compact-choice-button.js";
import { FilterPickerTriggerControl } from "../controls/filters/pickers/filter-picker-trigger.js";

export function createFilterPickerDialogControl(options: {
  id: string;
  dialogClassName: string;
  titleId: string;
  titleKey: string;
  title: string;
  choicesClassName: string;
}) {
  const dialog = document.createElement("dialog");
  dialog.className = `filter-picker-dialog ${options.dialogClassName}`;
  dialog.id = options.id;
  dialog.setAttribute("aria-labelledby", options.titleId);

  const heading = createDialogHeading({
    titleId: options.titleId,
    titleKey: options.titleKey,
    title: options.title,
  });

  const choices = document.createElement("div");
  choices.className = `compact-choices ${options.choicesClassName}`;
  choices.setAttribute("role", "radiogroup");
  choices.setAttribute("aria-labelledby", options.titleId);

  dialog.append(heading, choices);
  return { dialog, choices };
}

export function createFilterPickerTriggerControl(options: {
  triggerClassName: string;
  controlsId: string;
  kindKey: string;
  kind: string;
  valueKey: string;
  value: string;
}) {
  return FilterPickerTriggerControl.create(options);
}

export function createCompactChoiceControl(options: {
  value: string;
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const button = CompactChoiceButtonControl.create({
    ariaLabel: options.label,
    emoji: options.emoji,
    label: options.label,
    selected: options.selected,
    value: options.value,
  }) as HTMLButtonElement;
  setPressedState(button, options.selected, "is-selected");
  button.addEventListener("click", options.onSelect);
  return button;
}
