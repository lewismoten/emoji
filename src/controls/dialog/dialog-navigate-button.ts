import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

const dialogNavigateButtonStyleId = "dialog-navigate-button-control-style";
const dialogNavigateButtonStyleText = `
.dialog-navigate {
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
  font-size: var(--ui-font-size-x-large);
  line-height: 1;
}

[dir="rtl"] .dialog-navigate {
  transform: scaleX(-1);
}

.dialog-navigate:disabled {
  cursor: default;
  opacity: 0.35;
}
`;

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

  protected styles() {
    return [
      {
        id: dialogNavigateButtonStyleId,
        text: dialogNavigateButtonStyleText,
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
