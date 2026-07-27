import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";

const genderFilterStylesheetId = "gender-filter-control-stylesheet";
const genderFilterStylesheetHref = "./explorer/controls/gender-filter.css";

type GenderFilterItem = {
  emoji: string;
  label: string;
  labelKey: string;
  value: string;
};

type GenderFilterState = {
  className: string;
  items: GenderFilterItem[];
  legend: string;
  legendKey: string;
};

export class GenderFilterControl extends BaseControl<GenderFilterState> {
  constructor(state?: Partial<GenderFilterState>) {
    super({
      className: "gender-filter",
      items: [
        {
          emoji: "👨",
          label: "Male",
          labelKey: "male",
          value: "male",
        },
        {
          emoji: "👩",
          label: "Female",
          labelKey: "female",
          value: "female",
        },
        {
          emoji: "🧑",
          label: "Neutral",
          labelKey: "neutral",
          value: "neutral",
        },
      ],
      legend: "Gender",
      legendKey: "gender",
      ...state,
    });
  }

  protected override stylesheets() {
    return [
      {
        href: genderFilterStylesheetHref,
        id: genderFilterStylesheetId,
      },
    ];
  }

  protected render(): NodeSpec {
    return DomFactory.element("fieldset", {
      className: this.state.className,
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
                className: "gender",
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
