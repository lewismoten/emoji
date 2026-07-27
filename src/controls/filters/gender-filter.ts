import { ModifierFilterControl } from "./modifier-filter-control.js";

const genderFilterStylesheetId = "gender-filter-control-stylesheet";
const genderFilterStylesheetHref = "./explorer/controls/filters/modifier-filter-control.css";

export class GenderFilterControl extends ModifierFilterControl {
  constructor(state?: Partial<ConstructorParameters<typeof ModifierFilterControl>[0]>) {
    super({
      className: "gender-filter",
      inputClassName: "gender",
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

}
