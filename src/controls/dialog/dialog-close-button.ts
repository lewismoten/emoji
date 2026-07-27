import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

export const dialogCloseButtonLabel = "Close";
export const dialogCloseButtonText = "×";
export const dialogCloseButtonClassName = "dialog-close";
export const dialogCloseButtonAriaKey = "close";
export const dialogCloseButtonStylesheetId =
  "dialog-close-button-control-stylesheet";
export const dialogCloseButtonStylesheetHref =
  "./explorer/controls/dialog/dialog-close-button.css";

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

  protected stylesheets() {
    return [
      {
        href: dialogCloseButtonStylesheetHref,
        id: dialogCloseButtonStylesheetId,
      },
    ];
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
