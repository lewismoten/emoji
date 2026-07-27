import { BaseControl } from "../core/base-control.js";
import { ToggleButtonControl } from "../core/toggle-button.js";

const versionModeToggleStylesheetId =
  "version-mode-toggle-control-stylesheet";
const versionModeToggleStylesheetHref =
  "./explorer/controls/filters/version-mode-toggle.css";

type VersionModeToggleState = {
  emoji: string;
  pressed: boolean;
};

export class VersionModeToggleControl extends BaseControl<VersionModeToggleState> {
  constructor(state: VersionModeToggleState) {
    super(state);
  }

  protected stylesheets() {
    return [
      {
        href: versionModeToggleStylesheetHref,
        id: versionModeToggleStylesheetId,
      },
    ];
  }

  protected render() {
    return ToggleButtonControl.toSpec({
      ariaLabel: "Toggle selected version mode",
      className: "version-mode-toggle",
      emoji: this.state.emoji,
      pressed: this.state.pressed,
      title: "Toggle selected version mode",
      value: "selected-version",
    });
  }
}
