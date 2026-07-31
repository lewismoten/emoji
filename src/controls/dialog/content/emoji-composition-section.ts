import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { TextControl } from "../../core/text-control.js";

const emojiCompositionSectionStylesheetId =
  "emoji-composition-section-control-style";
const emojiCompositionSectionStyleText = `
.emoji-composition {
  min-width: 0;
  padding: 0 1rem 0.85rem;
}

.emoji-composition-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.emoji-composition h3 {
  margin: 0;
  color: var(--muted);
  font-size: 0.72rem;
}

.emoji-composition-mode {
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm-md);
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: 650 0.66rem/1.2 var(--ui-font);
}

.emoji-composition-mode:hover {
  border-color: var(--accent);
  background: var(--accent-surface);
}

.emoji-composition-mode:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.emoji-composition-mode[hidden] {
  display: none;
}

.emoji-composition-equation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.1rem;
}

[dir="rtl"] .emoji-composition-equation {
  direction: rtl;
  justify-content: flex-start;
}

.emoji-composition-term {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.25rem;
}

.emoji-composition-part {
  display: grid;
  flex: 0 0 auto;
  min-width: 2.65rem;
  min-height: 2.85rem;
  place-items: center;
  align-content: center;
  gap: 0.15rem;
  padding: 0.25rem 0.3rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md-lg);
  background: transparent;
  color: var(--text);
}

.emoji-composition-part:has(.emoji-composition-glyph.has-pixel-art) {
  min-width: 3rem;
  padding-inline: 0.25rem;
}

button.emoji-composition-part {
  border-color: var(--border);
  background: var(--panel-strong);
  cursor: pointer;
  font: inherit;
}

button.emoji-composition-part:hover {
  border-color: var(--accent);
  background: var(--accent-surface);
}

button.emoji-composition-part:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.emoji-composition-glyph {
  font-family: var(--system-emoji-font);
  font-size: 1.45rem;
  font-variant-emoji: emoji;
  line-height: 1.1;
}

.emoji-composition-result .emoji-composition-glyph {
  font-family: var(--system-emoji-font);
}

.emoji-composition-glyph.has-pixel-art {
  font-family: var(--emoji-font);
  font-size: 1.5rem;
  font-variant-emoji: normal;
  line-height: 1;
}

.emoji-composition-glyph.has-proposed-pixel-art {
  font-family:
    var(--pixel-emoji-proposed-family, "Pixel Emoji Proposed"),
    var(--emoji-font);
}

.emoji-composition-glyph.is-symbolic {
  font-family: var(--ui-font);
  font-size: 0.64rem;
  font-weight: 800;
}

.emoji-composition-code {
  color: var(--muted);
  font:
    600 0.54rem/1.1 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
}

.emoji-composition-code-point,
.emoji-composition-code-condensed {
  direction: ltr;
  unicode-bidi: isolate;
}

.emoji-composition-operator {
  flex: 0 0 auto;
  color: var(--accent);
  font-size: 1rem;
  font-weight: 800;
}

.emoji-composition-result {
  border-color: var(--border);
  background: var(--panel-strong);
}
`;

type EmojiCompositionSectionState = {
  className?: string;
  headingKey: string;
  headingText: string;
  modeButtonLabel: string;
  modeButtonLabelKey?: string;
};

export class EmojiCompositionSectionControl extends BaseControl<EmojiCompositionSectionState> {
  constructor(state?: Partial<EmojiCompositionSectionState>) {
    super({
      className: "emoji-composition developer-only",
      headingKey: "builtFrom",
      headingText: "Built from",
      modeButtonLabel: "Show full sequence",
      modeButtonLabelKey: "showFullSequence",
      ...state,
    });
  }

  protected styles() {
    return [
      {
        text: emojiCompositionSectionStyleText,
        id: emojiCompositionSectionStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.element("section", {
      attributes: { hidden: "" },
      children: [
        DomFactory.element("div", {
          className: "emoji-composition-heading",
          children: [
            new TextControl({
              i18nKey: this.state.headingKey,
              tag: "h3",
              text: this.state.headingText,
            }).renderForParent(),
            DomFactory.button({
              attributes: {
                "aria-label": this.state.modeButtonLabel,
                "aria-pressed": "false",
                hidden: "",
                type: "button",
              },
              className: "emoji-composition-mode",
              dataset: this.state.modeButtonLabelKey
                ? {
                    i18n: this.state.modeButtonLabelKey,
                    i18nAriaLabel: this.state.modeButtonLabelKey,
                  }
                : undefined,
              text: this.state.modeButtonLabel,
            }),
          ],
        }),
        DomFactory.element("div", {
          attributes: { dir: "ltr" },
          className: "emoji-composition-equation",
        }),
      ],
      className: this.state.className,
    });
  }
}
