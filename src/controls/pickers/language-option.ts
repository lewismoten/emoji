import { BaseControl } from "../core/base-control.js";
import { ToggleButtonControl } from "../core/toggle-button.js";

type LanguageOptionState = {
  flag: string;
  href?: string;
  label: string;
  locale: string;
  selected: boolean;
};

export class LanguageOptionControl extends BaseControl<LanguageOptionState> {
  constructor(state: LanguageOptionState) {
    super(state);
  }

  static toMarkup(state: LanguageOptionState) {
    return new LanguageOptionControl(state).toMarkup();
  }

  protected render() {
    return ToggleButtonControl.toSpec({
      ariaLabel: this.state.label,
      className: `language-option${this.state.selected ? " is-selected" : ""}`,
      dataAttributes: this.state.href ? { href: this.state.href } : undefined,
      emoji: this.state.flag,
      emojiClassName: "language-option-flag",
      inputClassName: "language-option-input",
      inputName: "language-choice",
      inputType: "radio",
      label: this.state.label,
      labelClassName: "language-option-label",
      pressed: this.state.selected,
      role: "radio",
      tabIndex: this.state.selected ? 0 : -1,
      value: this.state.locale,
    });
  }
}
