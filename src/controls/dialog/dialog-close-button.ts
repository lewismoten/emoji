import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

export const dialogCloseButtonLabel = "Close";
export const dialogCloseButtonText = "×";
export const dialogCloseButtonClassName = "dialog-close";
export const dialogCloseButtonAriaKey = "close";
export const dialogCloseButtonStyleId = "dialog-close-button-control-style";
export const dialogCloseButtonStyleText = `
.dialog-close {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-family: var(--ui-font);
  font-weight: 400;
  font-style: normal;
  font-variant: normal;
  font-size: var(--ui-font-size-display-medium-small);
  line-height: 1;
}
`;

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

  protected styles() {
    return [
      {
        id: dialogCloseButtonStyleId,
        text: dialogCloseButtonStyleText,
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
