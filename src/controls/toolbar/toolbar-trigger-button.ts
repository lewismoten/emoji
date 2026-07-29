import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";

const toolbarTriggerButtonStylesheetId =
  "toolbar-trigger-button-control-stylesheet";
const toolbarTriggerButtonStylesheetHref =
  "./explorer/controls/toolbar/toolbar-trigger-button.css";

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
  protected override stylesheets() {
    return [
      {
        href: toolbarTriggerButtonStylesheetHref,
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
