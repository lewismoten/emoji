import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { TextControl } from "../../core/text-control.js";

const emojiCompositionSectionStylesheetId =
  "emoji-composition-section-control-stylesheet";
const emojiCompositionSectionStylesheetHref =
  "./explorer/controls/dialog/content/emoji-composition-section.css";

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

  protected stylesheets() {
    return [
      {
        href: emojiCompositionSectionStylesheetHref,
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
