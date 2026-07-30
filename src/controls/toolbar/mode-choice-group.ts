import { BaseControl } from "../core/base-control.js";
import { ChoiceGroupControl } from "../groups/choice-group.js";

type ModeChoice = {
  emoji: string;
  key: string;
  text: string;
  value: string;
};

type ModeChoiceGroupState = {
  label: string;
  labelKey: string;
  modes: ModeChoice[];
};

export class ModeChoiceGroupControl extends BaseControl<ModeChoiceGroupState> {
  constructor(state?: Partial<ModeChoiceGroupState>) {
    super({
      label: "Mode",
      labelKey: "mode",
      modes: [
        { emoji: "🙂", key: "standard", text: "Standard", value: "standard" },
        { emoji: "🔎", key: "advanced", text: "Advanced", value: "advanced" },
        {
          emoji: "🛠️",
          key: "developer",
          text: "Developer",
          value: "developer",
        },
      ],
      ...state,
    });
  }

  protected render() {
    return ChoiceGroupControl.toSpec({
      buttonClassName: "setting-choice mode-choice",
      className: "setting-choice-group mode-choices",
      inputClassName: "mode-choice-input",
      inputName: "mode-choice",
      inputType: "radio",
      items: this.state.modes.map((mode) => ({
        ariaLabel: mode.text,
        dataAttributes: { mode: mode.value },
        emoji: mode.emoji,
        label: mode.text,
        labelKey: mode.key,
        selected: false,
        value: mode.value,
      })),
      label: this.state.label,
      labelKey: this.state.labelKey,
      maxSelectable: 1,
      minSelectable: 1,
      role: "radiogroup",
      wrapperTag: "div",
    });
  }
}
