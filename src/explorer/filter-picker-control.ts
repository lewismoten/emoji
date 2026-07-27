import {
  createDialogHeading,
  setPressedState,
} from "./dialog-control-helpers.js";

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

export function createCompactChoiceControl(options: {
  value: string;
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "compact-choice";
  button.dataset.value = options.value;
  button.setAttribute("role", "radio");
  setPressedState(button, options.selected, "is-selected");
  button.setAttribute("aria-checked", String(options.selected));
  button.tabIndex = options.selected ? 0 : -1;
  button.setAttribute("aria-label", options.label);
  button.title = options.label;

  const icon = document.createElement("span");
  icon.className = "compact-choice-emoji";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = options.emoji;

  const text = document.createElement("span");
  text.className = "compact-choice-label";
  text.textContent = options.label;

  button.replaceChildren(icon, text);
  button.addEventListener("click", options.onSelect);
  return button;
}
