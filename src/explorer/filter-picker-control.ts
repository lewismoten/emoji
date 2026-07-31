import {
  setPressedState,
} from "./dialog/dialog-control-helpers.js";
import { CompactChoiceButtonControl } from "../controls/filters/pickers/compact-choice-button.js";
import { FilterPickerDialogControl } from "../controls/filters/pickers/filter-picker-dialog.js";
import { FilterPickerTriggerControl } from "../controls/filters/pickers/filter-picker-trigger.js";

export function createFilterPickerDialogControl(options: {
  id: string;
  dialogClassName: string;
  titleId: string;
  titleKey: string;
  title: string;
  choicesClassName: string;
}) {
  const dialog = FilterPickerDialogControl.create({
    choicesClassName: options.choicesClassName,
    className: `filter-picker-dialog ${options.dialogClassName}`,
    dialogId: options.id,
    title: options.title,
    titleId: options.titleId,
    titleKey: options.titleKey,
  }) as HTMLDialogElement;
  const choicesClassName = options.choicesClassName.trim().split(/\s+/).pop()!;
  const choices = dialog.querySelector(
    `.${choicesClassName}`,
  ) as HTMLDivElement;
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
