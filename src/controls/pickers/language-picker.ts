import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

const languagePickerStyleId = "language-picker-control-style";
const languagePickerStyleText = `
.language-picker {
  display: inline-flex;
  flex: 0 1 13rem;
  align-items: center;
  gap: 0.35rem;
  min-width: 10rem;
  height: 2.25rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.language-picker:hover {
  border-color: var(--accent);
}

.language-picker:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset);
}

.language-picker:disabled {
  cursor: wait;
  opacity: 0.65;
}

.language-picker-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.language-picker-flag {
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 2rem;
  height: 2rem;
  font-family: var(--emoji-font);
  font-size: var(--emoji-control-size, var(--ui-font-size-display-medium));
  line-height: var(--emoji-control-line-height, 1.2);
  text-align: center;
}
`;

type LanguagePickerState = {
  accessibleLabel: string;
  accessibleLabelId: string;
  buttonClassName?: string;
  controlsId: string;
  flag: string;
  label: string;
  labelId: string;
};

export class LanguagePickerControl extends BaseControl<LanguagePickerState> {
  constructor(state: LanguagePickerState) {
    super(state);
  }

  protected styles() {
    return [
      {
        id: languagePickerStyleId,
        text: languagePickerStyleText,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controlsId,
        "aria-label": this.state.accessibleLabel,
        "aria-haspopup": "dialog",
        "aria-labelledby": `${this.state.accessibleLabelId} ${this.state.labelId}`,
        type: "button",
      },
      className: this.state.buttonClassName ?? "language-picker",
      children: [
        DomFactory.element("span", {
          attributes: { id: this.state.accessibleLabelId },
          className: "sr-only",
          dataset: { i18n: "chooseLanguage" },
          requireI18n: true,
          text: this.state.accessibleLabel,
        }),
        DomFactory.element("span", {
          attributes: { "aria-hidden": "true" },
          className: "language-picker-flag",
          text: this.state.flag,
        }),
        DomFactory.element("span", {
          attributes: { id: this.state.labelId },
          className: "language-picker-label",
          dataset: { i18n: "language" },
          requireI18n: true,
          text: this.state.label,
        }),
      ],
    });
  }
}
