import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { DialogControl } from "../dialog-control.js";
import { TextControl } from "../../core/text-control.js";

const languageDialogStyleId = "language-dialog-control-style";
const languageDialogStyleText = `
.dialog-description {
  margin: 0.8rem 1rem;
  color: var(--muted);
  font-size: var(--ui-font-size-medium-large);
}

.language-list {
  display: grid;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.language-option {
  position: relative;
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.55rem;
  align-items: center;
  width: 100%;
  min-height: 3.2rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--panel-strong);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
}

.language-option-input {
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

.language-option:hover {
  border-color: var(--accent);
  background: var(--accent-surface);
}

.language-option.is-selected {
  grid-template-columns: 2rem 1fr auto;
  border-color: var(--accent);
  background: var(--selected-control-bg);
  box-shadow: var(--shadow-selected-inset, none);
  color: var(--selected-control-text);
}

.language-option.is-selected::after {
  content: "✓";
  color: inherit;
  font-weight: 800;
}

.language-option:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset);
}

.language-option-flag {
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

.language-option-label {
  font-weight: 700;
}
`;

type LanguageDialogState = {
  description: string;
  descriptionKey: string;
  dialogId: string;
  eyebrow: string;
  eyebrowKey: string;
  title: string;
  titleId: string;
  titleKey: string;
};

export class LanguageDialogControl extends BaseControl<LanguageDialogState> {
  constructor(state?: Partial<LanguageDialogState>) {
    super({
      description: "Choose a language for emoji search.",
      descriptionKey: "chooseLanguageDescription",
      dialogId: "language-dialog",
      eyebrow: "Localized search",
      eyebrowKey: "localizedSearch",
      title: "Choose a search language",
      titleId: "language-title",
      titleKey: "chooseLanguage",
      ...state,
    });
  }

  protected styles() {
    return [
      {
        id: languageDialogStyleId,
        text: languageDialogStyleText,
      },
    ];
  }

  protected childControls() {
    return [
      new DialogControl({
        children: [],
        className: "language-dialog",
        dialogId: this.state.dialogId,
        eyebrow: this.state.eyebrow,
        eyebrowKey: this.state.eyebrowKey,
        title: this.state.title,
        titleId: this.state.titleId,
        titleKey: this.state.titleKey,
      }),
    ];
  }

  protected render() {
    return DialogControl.toSpec({
      children: [
        new TextControl({
          className: "dialog-description",
          i18nKey: this.state.descriptionKey,
          tag: "p",
          text: this.state.description,
        }).renderForParent(),
        DomFactory.element("div", {
          attributes: {
            "aria-labelledby": this.state.titleId,
            role: "radiogroup",
          },
          className: "language-list",
        }),
      ],
      className: "language-dialog",
      dialogId: this.state.dialogId,
      eyebrow: this.state.eyebrow,
      eyebrowKey: this.state.eyebrowKey,
      title: this.state.title,
      titleId: this.state.titleId,
      titleKey: this.state.titleKey,
    });
  }
}
