function createToolbarTriggerButton(options: {
  className: string;
  controls: string;
  ariaLabelKey: string;
  ariaLabel: string;
  icon: string;
  labelKey?: string;
  label?: string;
  labelClassName?: string;
  iconClassName?: string;
}) {
  const button = document.createElement("button");
  button.className = options.className;
  button.type = "button";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", options.controls);
  button.dataset.i18nAriaLabel = options.ariaLabelKey;
  button.setAttribute("aria-label", options.ariaLabel);

  const icon = document.createElement("span");
  if (options.iconClassName) icon.className = options.iconClassName;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = options.icon;
  button.append(icon);

  if (options.labelKey && options.label) {
    const label = document.createElement("span");
    if (options.labelClassName) label.className = options.labelClassName;
    label.dataset.i18n = options.labelKey;
    label.textContent = options.label;
    button.append(label);
  }

  return button;
}

export function createSavedPickerControl() {
  return createToolbarTriggerButton({
    ariaLabel: "Saved emoji",
    ariaLabelKey: "savedEmoji",
    className: "saved-picker",
    controls: "saved-dialog",
    icon: "⭐",
    iconClassName: "modifier-emoji favorite-glyph",
    label: "Favorites",
    labelClassName: "saved-picker-label",
    labelKey: "favorites",
  });
}

export function createHelpPickerControl() {
  return createToolbarTriggerButton({
    ariaLabel: "Help and settings",
    ariaLabelKey: "helpAndSettings",
    className: "help-picker",
    controls: "help-dialog",
    icon: "?",
  });
}
