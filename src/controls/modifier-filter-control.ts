import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";
import { ModifierFilterOptionControl } from "./modifier-filter-option.js";

export type ModifierFilterItem = {
  emoji: string;
  label: string;
  labelKey: string;
  value: string;
};

export type ModifierFilterState = {
  className: string;
  inputClassName: string;
  items: ModifierFilterItem[];
  legend: string;
  legendKey: string;
};

export abstract class ModifierFilterControl extends BaseControl<ModifierFilterState> {
  protected render(): NodeSpec {
    return DomFactory.element("fieldset", {
      className: `modifier-filter ${this.state.className}`,
      children: [
        DomFactory.element("legend", {
          dataset: {
            i18n: this.state.legendKey,
          },
          text: this.state.legend,
        }),
        ...this.state.items.map((item) =>
          ModifierFilterOptionControl.toSpec({
            emoji: item.emoji,
            inputClassName: this.state.inputClassName,
            label: item.label,
            labelKey: item.labelKey,
            value: item.value,
          }),
        ),
      ],
    });
  }
}
