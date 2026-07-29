import { ModifierFilterControl } from "./modifier-filter-control.js";

const hairFilterStylesheetId = "hair-filter-control-stylesheet";
const hairFilterStylesheetHref =
  "./explorer/controls/filters/modifiers/modifier-filter-control.css";

export class HairFilterControl extends ModifierFilterControl {
  constructor(
    state?: Partial<ConstructorParameters<typeof ModifierFilterControl>[0]>,
  ) {
    super({
      className: "hair-filter",
      inputClassName: "hair",
      items: [
        {
          emoji: "🧑‍🦰",
          label: "Red",
          labelKey: "red",
          value: "1F9B0",
        },
        {
          emoji: "🧑‍🦱",
          label: "Curly",
          labelKey: "curly",
          value: "1F9B1",
        },
        {
          emoji: "🧑‍🦲",
          label: "Bald",
          labelKey: "bald",
          value: "1F9B2",
        },
        {
          emoji: "🧑‍🦳",
          label: "White",
          labelKey: "white",
          value: "1F9B3",
        },
      ],
      legend: "Hair",
      legendKey: "hair",
      maxSelectable: 1,
      minSelectable: 0,
      ...state,
    });
  }

  protected override stylesheets() {
    return [
      {
        href: hairFilterStylesheetHref,
        id: hairFilterStylesheetId,
      },
    ];
  }
}
