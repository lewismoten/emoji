import { BaseControl } from "../core/base-control.js";
import type { NodeSpec } from "../core/dom-factory.js";
import { ChoiceGroupControl } from "../groups/choice-group.js";

type EmojiFontChoice = {
  className: string;
  font: string;
  glyphClassName: string;
  glyphText: string;
  label: string;
  labelKey: string;
  selected: boolean;
  tabIndex: number;
};

type EmojiFontChoiceGroupState = {
  ariaLabel: string;
  ariaLabelKey: string;
  choices: EmojiFontChoice[];
  className: string;
};

export class EmojiFontChoiceGroupControl extends BaseControl<EmojiFontChoiceGroupState> {
  constructor(state?: Partial<EmojiFontChoiceGroupState>) {
    super({
      ariaLabel: "Emoji style",
      ariaLabelKey: "emojiStyle",
      className: "pixel-comparison",
      choices: [
        {
          className: "emoji-font-choice emoji-font-choice-system",
          font: "system",
          glyphClassName: "pixel-comparison-system",
          glyphText: "😀",
          label: "System",
          labelKey: "system",
          selected: false,
          tabIndex: -1,
        },
        {
          className: "emoji-font-choice emoji-font-choice-pixel",
          font: "pixel",
          glyphClassName: "pixel-comparison-custom",
          glyphText: "😀",
          label: "Pixel",
          labelKey: "pixel",
          selected: true,
          tabIndex: 0,
        },
      ],
      ...state,
    });
  }

  static toSpec(state?: Partial<EmojiFontChoiceGroupState>): NodeSpec {
    return new EmojiFontChoiceGroupControl(state).render();
  }

  protected render(): NodeSpec {
    return ChoiceGroupControl.toSpec({
      buttonClassName: "emoji-font-choice",
      className: this.state.className,
      inputClassName: "emoji-font-choice-input",
      inputName: "emoji-font-choice",
      inputType: "radio",
      items: this.state.choices.map((choice) => ({
        ariaLabel: choice.label,
        className: choice.className.replace(/^emoji-font-choice\s*/, ""),
        dataAttributes: { emojiFont: choice.font },
        emoji: choice.glyphText,
        emojiClassName: choice.glyphClassName,
        label: choice.label,
        labelKey: choice.labelKey,
        selected: choice.selected,
        value: choice.font,
      })),
      label: this.state.ariaLabel,
      labelKey: this.state.ariaLabelKey,
      maxSelectable: 1,
      minSelectable: 1,
      role: "radiogroup",
      toggleContentOrder: "label-emoji",
      toggleEmojiTag: "b",
      toggleLabelTag: "small",
      wrapperTag: "div",
    });
  }
}
