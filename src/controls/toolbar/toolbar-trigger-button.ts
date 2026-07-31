import {
  ActionButtonControl,
  type ActionButtonState,
} from "../core/action-button.js";

const toolbarTriggerButtonStylesheetId =
  "toolbar-trigger-button-control-style";
const toolbarTriggerButtonStyleText = `
.saved-picker,
.help-picker {
  flex: 0 0 auto;
  min-height: 2.5rem;
}

.saved-picker {
  min-width: 6.5rem;
  max-width: 7rem;
  padding: 0 0.55rem;
}

.saved-picker-label {
  min-width: 3.75rem;
  overflow: hidden;
  font-size: var(--ui-font-size-x-small);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.help-picker {
  width: 2.5rem;
  padding: 0;
  font-weight: 800;
}
`;

type ToolbarTriggerButtonState = {
  ariaLabel: string;
  ariaLabelKey: string;
  className: string;
  controls: string;
  icon: string;
  iconClassName?: string;
  label?: string;
  labelClassName?: string;
  labelKey?: string;
};

export class ToolbarTriggerButtonControl extends ActionButtonControl<ToolbarTriggerButtonState> {
  protected override styles() {
    return [
      {
        text: toolbarTriggerButtonStyleText,
        id: toolbarTriggerButtonStylesheetId,
      },
    ];
  }

  protected render() {
    return this.renderButton({
      ariaLabel: this.state.ariaLabel,
      attributes: {
        "aria-controls": this.state.controls,
        "aria-haspopup": "dialog",
      },
      className: `setting-choice ${this.state.className}`,
      emoji: this.state.icon,
      emojiClassName: this.state.iconClassName,
      i18nAriaLabel: this.state.ariaLabelKey,
      label: this.state.label,
      labelClassName: this.state.labelClassName,
      labelKey: this.state.labelKey,
    } satisfies ActionButtonState);
  }
}
