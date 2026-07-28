import { BaseControl } from "../core/base-control.js";
import { ChoiceGroupControl } from "../groups/choice-group.js";

const themeChoiceGroupStylesheetId = "theme-choice-group-control-stylesheet";
const themeChoiceGroupStylesheetHref = "./explorer/controls/toolbar/theme-choice-group.css";

type ThemeChoice = {
  emoji: string;
  key: string;
  text: string;
  theme: string;
};

type ThemeChoiceGroupState = {
  label: string;
  labelKey: string;
  themes: ThemeChoice[];
};

export class ThemeChoiceGroupControl extends BaseControl<ThemeChoiceGroupState> {
  constructor(state?: Partial<ThemeChoiceGroupState>) {
    super({
      label: "Theme",
      labelKey: "theme",
      themes: [
        {
          theme: "base",
          emoji: "🧱",
          key: "base",
          text: "Base",
        },
        { theme: "light", emoji: "☀️", key: "light", text: "Light" },
        { theme: "dark", emoji: "🌙", key: "dark", text: "Dark" },
        { theme: "retro", emoji: "🕹️", key: "retro", text: "Retro" },
      ],
      ...state,
    });
  }

  protected override stylesheets() {
    return [
      {
        href: themeChoiceGroupStylesheetHref,
        id: themeChoiceGroupStylesheetId,
      },
    ];
  }

  protected render() {
    return ChoiceGroupControl.toSpec({
      buttonClassName: "setting-choice theme-choice",
      className: "setting-choice-group theme-choices",
      inputClassName: "theme-choice-input",
      inputName: "theme-choice",
      inputType: "radio",
      items: this.state.themes.map((theme) => ({
        ariaLabel: theme.text,
        dataAttributes: { theme: theme.theme },
        emoji: theme.emoji,
        className: theme.theme === "base" ? "developer-only" : undefined,
        label: theme.text,
        labelKey: theme.key,
        selected: false,
        value: theme.theme,
      })),
      label: this.state.label,
      labelKey: this.state.labelKey,
      maxSelectable: 1,
      minSelectable: 1,
      role: "radiogroup",
      toggleLabelClassName: undefined,
      wrapperTag: "div",
    });
  }
}
