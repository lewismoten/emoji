import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";

const compactChoiceButtonStylesheetId =
  "compact-choice-button-control-stylesheet";
const compactChoiceButtonStylesheetHref =
  "./explorer/controls/filters/pickers/compact-choice-button.css";

type CompactChoiceButtonState = {
  ariaLabel: string;
  emoji: string;
  label: string;
  selected: boolean;
  value: string;
};

export class CompactChoiceButtonControl extends BaseControl<CompactChoiceButtonState> {
  constructor(state: CompactChoiceButtonState) {
    super(state);
  }

  static toSpec(state: CompactChoiceButtonState) {
    return new CompactChoiceButtonControl(state).render();
  }

  protected stylesheets() {
    return [
      {
        href: compactChoiceButtonStylesheetHref,
        id: compactChoiceButtonStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-checked": String(this.state.selected),
        "aria-label": this.state.ariaLabel,
        role: "radio",
        tabindex: this.state.selected ? "0" : "-1",
        title: this.state.label,
        type: "button",
      },
      className: "compact-choice",
      dataset: { value: this.state.value },
      children: [
        DomFactory.element("span", {
          attributes: { "aria-hidden": "true" },
          className: "compact-choice-emoji",
          text: this.state.emoji,
        }),
        DomFactory.element("span", {
          className: "compact-choice-label",
          text: this.state.label,
        }),
      ],
    });
  }
}
