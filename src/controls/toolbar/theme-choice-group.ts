import { BaseControl } from "../core/base-control.js";
import type { NodeSpec } from "../core/dom-factory.js";
import { ChoiceGroupControl } from "../groups/choice-group.js";

const themeChoiceGroupStyleId = "theme-choice-group-control-style";
const themeChoiceGroupStyleText = `
.theme-choice {
  position: relative;
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
}

.theme-choice-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.theme-choice span[aria-hidden="true"] {
  font-family: var(--emoji-font);
  line-height: var(--emoji-control-line-height, 1.2);
}

html[data-theme="base"] .theme-choice {
  all: revert;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.45rem;
}

html[data-theme="base"] .theme-choice-input {
  all: revert;
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  accent-color: revert !important;
}

html[data-theme="base"] .theme-choices {
  display: grid;
  justify-content: flex-start;
  gap: 0.35rem;
}
`;

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

  static toSpec(state?: Partial<ThemeChoiceGroupState>): NodeSpec {
    return new ThemeChoiceGroupControl(state).render();
  }

  protected override styles() {
    return [
      {
        id: themeChoiceGroupStyleId,
        text: themeChoiceGroupStyleText,
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
        className:
          theme.theme === "base"
            ? "full-developer-only"
            : theme.theme === "retro"
              ? "advanced-only"
              : undefined,
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
