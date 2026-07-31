import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

const dialogModeBackButtonStyleId = "dialog-mode-back-button-control-style";
const dialogModeBackButtonStyleText = `
.dialog-mode-back {
  min-height: 2rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-family: var(--ui-font);
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
}

.dialog-mode-back[hidden] {
  display: none;
}
`;

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

  protected styles() {
    return [
      {
        id: dialogModeBackButtonStyleId,
        text: dialogModeBackButtonStyleText,
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
