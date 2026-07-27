import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

export const dialogCloseButtonLabel = "Close";
export const dialogCloseButtonText = "×";
export const dialogCloseButtonClassName = "dialog-close";
export const dialogCloseButtonAriaKey = "close";

type DialogCloseButtonState = {
  buttonClassName: string;
  label: string;
  text: string;
  i18nAriaLabel: string;
};

export class DialogCloseButtonControl extends BaseControl<DialogCloseButtonState> {
  constructor(state?: Partial<DialogCloseButtonState>) {
    super({
      buttonClassName: dialogCloseButtonClassName,
      i18nAriaLabel: dialogCloseButtonAriaKey,
      label: dialogCloseButtonLabel,
      text: dialogCloseButtonText,
      ...state,
    });
  }

  protected render() {
    return DialogCloseButtonControl.toSpec(this.state);
  }

  static toSpec(state?: Partial<DialogCloseButtonState>) {
    const resolved = {
      buttonClassName: dialogCloseButtonClassName,
      i18nAriaLabel: dialogCloseButtonAriaKey,
      label: dialogCloseButtonLabel,
      text: dialogCloseButtonText,
      ...state,
    };
    return DomFactory.form({
      attributes: { method: "dialog" },
      children: [
        DomFactory.button({
          attributes: {
            "aria-label": resolved.label,
            type: "submit",
          },
          className: resolved.buttonClassName,
          dataset: {
            i18nAriaLabel: resolved.i18nAriaLabel,
          },
          text: resolved.text,
        }),
      ],
    });
  }
}
