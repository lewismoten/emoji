import {
  createDialogHeading,
  setPressedState,
} from "./dialog-control-helpers.js";
import { CompactChoiceButtonControl } from "../controls/compact-choice-button.js";

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
  const button = document.createElement("button");
  button.className = `filter-picker-trigger ${options.triggerClassName}`;
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", options.controlsId);

  const kind = document.createElement("span");
  kind.className = "filter-picker-kind";
  kind.dataset.i18n = options.kindKey;
  kind.textContent = options.kind;

  const emoji = document.createElement("span");
  emoji.className = "filter-picker-emoji";
  emoji.setAttribute("aria-hidden", "true");
  emoji.textContent = "🌐";

  const value = document.createElement("span");
  value.className = "filter-picker-value";
  value.dataset.i18n = options.valueKey;
  value.textContent = options.value;

  button.append(kind, emoji, value);
  return button;
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
