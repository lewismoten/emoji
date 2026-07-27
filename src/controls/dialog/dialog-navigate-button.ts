import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

const dialogNavigateButtonStylesheetId =
  "dialog-navigate-button-control-stylesheet";
const dialogNavigateButtonStylesheetHref =
  "./explorer/controls/dialog/dialog-navigate-button.css";

export const dialogNavigateButtonClassName = "dialog-navigate";

type DialogNavigateButtonState = {
  ariaLabel: string;
  buttonClassName?: string;
  disabled?: boolean;
  hidden?: boolean;
  text: string;
};

export class DialogNavigateButtonControl extends BaseControl<DialogNavigateButtonState> {
  constructor(state: DialogNavigateButtonState) {
    super(state);
  }

  static toSpec(state: DialogNavigateButtonState) {
    return new DialogNavigateButtonControl(state).render();
  }

  protected stylesheets() {
    return [
      {
        href: dialogNavigateButtonStylesheetHref,
        id: dialogNavigateButtonStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-label": this.state.ariaLabel,
        ...(this.state.disabled ? { disabled: "disabled" } : {}),
        ...(this.state.hidden ? { hidden: "hidden" } : {}),
        type: "button",
      },
      className: this.state.buttonClassName ?? dialogNavigateButtonClassName,
      text: this.state.text,
    });
  }
}
