import { ToolbarTriggerButtonControl } from "../../controls/toolbar/toolbar-trigger-button.js";

export function createSavedPickerControl() {
  return ToolbarTriggerButtonControl.create({
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
  return ToolbarTriggerButtonControl.create({
    ariaLabel: "Help and settings",
    ariaLabelKey: "helpAndSettings",
    className: "help-picker",
    controls: "help-dialog",
    icon: "?",
  });
}
