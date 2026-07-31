import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";

export type ToggleButtonState = {
  ariaLabel: string;
  className: string;
  contentOrder?: "emoji-label" | "label-emoji";
  dataAttributes?: Record<string, string>;
  emoji?: string;
  emojiClassName?: string;
  emojiTag?: string;
  i18nAriaLabel?: string;
  inputClassName?: string;
  inputName?: string;
  inputType?: "checkbox" | "radio";
  label?: string;
  labelClassName?: string;
  labelKey?: string;
  labelTag?: string;
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
    const emojiNode = this.state.emoji
      ? DomFactory.element(this.state.emojiTag ?? "span", {
          attributes: { "aria-hidden": "true" },
          className: this.state.emojiClassName,
          text: this.state.emoji,
        })
      : null;
    const labelNode = this.state.label
      ? DomFactory.element(this.state.labelTag ?? "span", {
          className: this.state.labelClassName,
          dataset: this.state.labelKey
            ? { i18n: this.state.labelKey }
            : undefined,
          text: this.state.label,
        })
      : null;
    const contentOrder = this.state.contentOrder ?? "emoji-label";
    const contentNodes =
      contentOrder === "label-emoji"
        ? [labelNode, emojiNode]
        : [emojiNode, labelNode];
    const renderedContentNodes = contentNodes.filter(
      (node): node is Exclude<typeof node, null> => node !== null,
    );

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
                  tabindex: "-1",
                  type: inputType,
                  value: this.state.value,
                },
                className: this.state.inputClassName,
              }),
            ]
          : []),
        ...renderedContentNodes,
      ],
    });
  }
}
