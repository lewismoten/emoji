import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";

const compactChoiceButtonStylesheetId = "compact-choice-button-control-style";
const compactChoiceButtonStyleText = `
.compact-choices {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: flex-start;
  gap: 0.3rem;
}

.compact-choice {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  height: 2.65rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  font-weight: 650;
}

.compact-choice-emoji {
  font-family: var(--emoji-font);
  font-size: var(--ui-font-size-xxx-large);
}

.compact-choice-label {
  font-size: var(--ui-font-size-medium-small);
  white-space: nowrap;
}

.compact-choice:hover {
  background: color-mix(in srgb, var(--panel) 82%, var(--accent));
}

.compact-choice[aria-checked="true"] {
  border-color: var(--accent);
  background: var(--selected-control-bg);
  color: var(--selected-control-text);
  box-shadow: var(--shadow-selected-inset, none);
}

.compact-choice:focus-visible {
  outline: 2px dashed var(--accent-strong);
  outline-offset: var(--focus-outline-offset);
}
`;

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

  protected styles() {
    return [
      {
        text: compactChoiceButtonStyleText,
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
