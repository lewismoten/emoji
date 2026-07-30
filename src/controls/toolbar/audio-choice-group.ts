import { BaseControl } from "../core/base-control.js";
import type { NodeSpec } from "../core/dom-factory.js";
import { ChoiceGroupControl } from "../groups/choice-group.js";

type AudioChoice = {
  emoji: string;
  key: string;
  text: string;
  value: string;
};

type AudioChoiceGroupState = {
  choices: AudioChoice[];
  label: string;
  labelKey: string;
};

export class AudioChoiceGroupControl extends BaseControl<AudioChoiceGroupState> {
  constructor(state?: Partial<AudioChoiceGroupState>) {
    super({
      choices: [
        {
          emoji: "🔊",
          key: "soundEffects",
          text: "Sound effects",
          value: "soundEffects",
        },
        {
          emoji: "🎵",
          key: "music",
          text: "Music",
          value: "music",
        },
      ],
      label: "Audio",
      labelKey: "audio",
      ...state,
    });
  }

  static toSpec(state?: Partial<AudioChoiceGroupState>): NodeSpec {
    return new AudioChoiceGroupControl(state).render();
  }

  protected render() {
    return ChoiceGroupControl.toSpec({
      buttonClassName: "setting-choice audio-choice",
      className: "setting-choice-group audio-choices",
      inputClassName: "audio-choice-input",
      inputType: "checkbox",
      items: this.state.choices.map((choice) => ({
        ariaLabel: choice.text,
        dataAttributes: { audioPreference: choice.value },
        emoji: choice.emoji,
        label: choice.text,
        labelKey: choice.key,
        selected: false,
        value: choice.value,
      })),
      label: this.state.label,
      labelKey: this.state.labelKey,
      legendClassName: "sr-only",
      maxSelectable: this.state.choices.length,
      minSelectable: 0,
      toggleLabelClassName: undefined,
      wrapperTag: "div",
    });
  }
}
