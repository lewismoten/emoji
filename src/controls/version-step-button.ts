import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

const versionStepButtonStylesheetId =
  "version-step-button-control-stylesheet";
const versionStepButtonStylesheetHref =
  "./explorer/controls/version-step-button.css";

type VersionStepButtonState = {
  ariaLabel: string;
  buttonClassName?: string;
  disabled?: boolean;
  text: string;
};

export class VersionStepButtonControl extends BaseControl<VersionStepButtonState> {
  constructor(state: VersionStepButtonState) {
    super(state);
  }

  protected stylesheets() {
    return [
      {
        href: versionStepButtonStylesheetHref,
        id: versionStepButtonStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-label": this.state.ariaLabel,
        ...(this.state.disabled ? { disabled: "disabled" } : {}),
        type: "button",
      },
      className: this.state.buttonClassName ?? "version-step",
      text: this.state.text,
    });
  }
}
