import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";

export type ToggleButtonState = {
  ariaLabel: string;
  className: string;
  dataAttributes?: Record<string, string>;
  emoji?: string;
  emojiClassName?: string;
  i18nAriaLabel?: string;
  inputClassName?: string;
  inputName?: string;
  inputType?: "checkbox" | "radio";
  label?: string;
  labelClassName?: string;
  labelKey?: string;
  pressed?: boolean;
  role?: string;
  tabIndex?: number;
  title?: string;
  value: string;
};

export class ToggleButtonControl extends BaseControl<ToggleButtonState> {
  constructor(state: ToggleButtonState) {
    super(state);
  }

  static toSpec(state: ToggleButtonState): NodeSpec {
    return new ToggleButtonControl(state).render();
  }

  protected render(): NodeSpec {
    const inputType = this.state.inputType ?? "checkbox";
    const pressed = this.state.pressed;
    const role = this.state.role;
    const tabIndex = this.state.tabIndex;
    const isButton = inputType === "radio" || inputType === "checkbox";

    return DomFactory.element("label", {
      attributes: {
        "aria-checked": role === "radio" ? String(Boolean(pressed)) : undefined,
        "aria-label": this.state.ariaLabel,
        "aria-pressed": role
          ? undefined
          : pressed === undefined
            ? undefined
            : String(Boolean(pressed)),
        role,
        tabindex: tabIndex === undefined ? undefined : String(tabIndex),
        title: this.state.title,
      },
      className: this.state.className,
      dataset: {
        ...(this.state.i18nAriaLabel
          ? { i18nAriaLabel: this.state.i18nAriaLabel }
          : {}),
        ...(this.state.dataAttributes ?? {}),
      },
      children: [
        ...(isButton
          ? [
              DomFactory.element("input", {
                attributes: {
                  checked: pressed ? "checked" : undefined,
                  name: this.state.inputName,
                  type: inputType,
                  value: this.state.value,
                },
                className: this.state.inputClassName,
              }),
            ]
          : []),
        ...(this.state.emoji
          ? [
              DomFactory.element("span", {
                attributes: { "aria-hidden": "true" },
                className: this.state.emojiClassName,
                text: this.state.emoji,
              }),
            ]
          : []),
        ...(this.state.label
          ? [
              DomFactory.element("span", {
                className: this.state.labelClassName,
                dataset: this.state.labelKey
                  ? { i18n: this.state.labelKey }
                  : undefined,
                text: this.state.label,
              }),
            ]
          : []),
      ],
    });
  }
}
