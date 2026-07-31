import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";

const versionStepButtonStyleId = "version-step-button-control-style";
const versionStepButtonStyleText = `
.version-step {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--ui-font-size-x-large) + 0.05rem);
  font-weight: 800;
}

.version-step:hover:not(:disabled) {
  border-color: var(--accent);
}

.version-step:disabled {
  cursor: default;
  opacity: 0.4;
}
`;

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

  protected styles() {
    return [
      {
        id: versionStepButtonStyleId,
        text: versionStepButtonStyleText,
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
