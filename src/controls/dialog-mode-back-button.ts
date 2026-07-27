import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

const dialogModeBackButtonStylesheetId =
  "dialog-mode-back-button-control-stylesheet";
const dialogModeBackButtonStylesheetHref =
  "./explorer/controls/dialog-mode-back-button.css";

export const dialogModeBackButtonClassName = "dialog-mode-back";

type DialogModeBackButtonState = {
  ariaLabel: string;
  buttonClassName?: string;
  hidden?: boolean;
  i18nAriaLabel?: string;
  i18nKey?: string;
  text: string;
};

export class DialogModeBackButtonControl extends BaseControl<DialogModeBackButtonState> {
  constructor(state: DialogModeBackButtonState) {
    super(state);
  }

  static toSpec(state: DialogModeBackButtonState) {
    return new DialogModeBackButtonControl(state).render();
  }

  protected stylesheets() {
    return [
      {
        href: dialogModeBackButtonStylesheetHref,
        id: dialogModeBackButtonStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-label": this.state.ariaLabel,
        ...(this.state.hidden ? { hidden: "hidden" } : {}),
        type: "button",
      },
      className: this.state.buttonClassName ?? dialogModeBackButtonClassName,
      dataset: {
        ...(this.state.i18nAriaLabel
          ? { i18nAriaLabel: this.state.i18nAriaLabel }
          : {}),
        ...(this.state.i18nKey ? { i18n: this.state.i18nKey } : {}),
      },
      text: this.state.text,
    });
  }
}
