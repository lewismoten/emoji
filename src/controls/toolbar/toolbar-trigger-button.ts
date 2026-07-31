import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";

const toolbarTriggerButtonStylesheetId =
  "toolbar-trigger-button-control-style";
const toolbarTriggerButtonStyleText = `
.saved-picker,
.help-picker {
  display: inline-flex;
  flex: 0 0 auto;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font: inherit;
}

.saved-picker {
  min-width: 6.5rem;
  max-width: 7rem;
  gap: 0.3rem;
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
  width: 2.25rem;
  font-weight: 800;
}

.saved-picker:hover,
.help-picker:hover {
  border-color: var(--accent);
}

.saved-picker:focus-visible,
.help-picker:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset);
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

export class ToolbarTriggerButtonControl extends BaseControl<ToolbarTriggerButtonState> {
  protected override styles() {
    return [
      {
        text: toolbarTriggerButtonStyleText,
        id: toolbarTriggerButtonStylesheetId,
      },
    ];
  }

  protected render(): NodeSpec {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controls,
        "aria-haspopup": "dialog",
        "aria-label": this.state.ariaLabel,
        type: "button",
      },
      className: this.state.className,
      dataset: {
        i18nAriaLabel: this.state.ariaLabelKey,
      },
      children: [
        DomFactory.element("span", {
          attributes: { "aria-hidden": "true" },
          className: this.state.iconClassName,
          text: this.state.icon,
        }),
        ...(this.state.label && this.state.labelKey
          ? [
              DomFactory.element("span", {
                className: this.state.labelClassName,
                dataset: { i18n: this.state.labelKey },
                text: this.state.label,
              }),
            ]
          : []),
      ],
    });
  }
}
