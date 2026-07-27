import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";

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
          DomFactory.element("label", {
            children: [
              DomFactory.element("input", {
                attributes: {
                  type: "checkbox",
                  value: item.value,
                },
                className: this.state.inputClassName,
              }),
              DomFactory.element("span", {
                className: "modifier-emoji",
                text: item.emoji,
              }),
              DomFactory.element("span", {
                className: "modifier-label",
                dataset: {
                  i18n: item.labelKey,
                },
                text: item.label,
              }),
            ],
          }),
        ),
      ],
    });
  }
}
