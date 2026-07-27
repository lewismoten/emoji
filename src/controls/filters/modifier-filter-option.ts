import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";

type ModifierFilterOptionState = {
  emoji: string;
  inputClassName: string;
  label: string;
  labelKey: string;
  value: string;
};

export class ModifierFilterOptionControl extends BaseControl<ModifierFilterOptionState> {
  constructor(state: ModifierFilterOptionState) {
    super(state);
  }

  static toSpec(state: ModifierFilterOptionState): NodeSpec {
    return new ModifierFilterOptionControl(state).render();
  }

  protected render(): NodeSpec {
    return DomFactory.element("label", {
      className: "modifier-filter-option",
      children: [
        DomFactory.element("input", {
          attributes: {
            type: "checkbox",
            value: this.state.value,
          },
          className: this.state.inputClassName,
        }),
        DomFactory.element("span", {
          className: "modifier-emoji",
          text: this.state.emoji,
        }),
        DomFactory.element("span", {
          className: "modifier-label",
          dataset: {
            i18n: this.state.labelKey,
          },
          text: this.state.label,
        }),
      ],
    });
  }
}
