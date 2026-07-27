import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";

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

  protected render(): NodeSpec {
    return DomFactory.element("div", {
      attributes: {
        "aria-label": this.state.label,
        role: "group",
      },
      className: "setting-choice-group theme-choices",
      dataset: {
        i18nAriaLabel: this.state.labelKey,
      },
      children: this.state.themes.map((theme) =>
        DomFactory.button({
          attributes: {
            "aria-label": theme.text,
            "aria-pressed": "false",
            type: "button",
          },
          className: "setting-choice theme-choice",
          dataset: {
            i18nAriaLabel: theme.key,
            theme: theme.theme,
          },
          children: [
            DomFactory.element("span", {
              attributes: { "aria-hidden": "true" },
              text: theme.emoji,
            }),
            DomFactory.element("span", {
              dataset: { i18n: theme.key },
              text: theme.text,
            }),
          ],
        }),
      ),
    });
  }
}
