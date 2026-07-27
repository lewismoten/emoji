import { ModifierFilterControl } from "./modifier-filter-control.js";

const skinToneFilterStylesheetId = "skin-tone-filter-control-stylesheet";
const skinToneFilterStylesheetHref =
  "./explorer/controls/modifier-filter-control.css";

export class SkinToneFilterControl extends ModifierFilterControl {
  constructor(state?: Partial<ConstructorParameters<typeof ModifierFilterControl>[0]>) {
    super({
      className: "skin-tone-filter",
      inputClassName: "skin-tone",
      items: [
        {
          emoji: "🏿",
          label: "Dark",
          labelKey: "dark",
          value: "1F3FF",
        },
        {
          emoji: "🏾",
          label: "Medium-dark",
          labelKey: "mediumDark",
          value: "1F3FE",
        },
        {
          emoji: "🏽",
          label: "Medium",
          labelKey: "medium",
          value: "1F3FD",
        },
        {
          emoji: "🏼",
          label: "Medium-light",
          labelKey: "mediumLight",
          value: "1F3FC",
        },
        {
          emoji: "🏻",
          label: "Light",
          labelKey: "light",
          value: "1F3FB",
        },
      ],
      legend: "Skin tone",
      legendKey: "skinTone",
      ...state,
    });
  }

  protected override stylesheets() {
    return [
      {
        href: skinToneFilterStylesheetHref,
        id: skinToneFilterStylesheetId,
      },
    ];
  }

}
