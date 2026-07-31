import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { DialogControl } from "../dialog-control.js";
import { TextControl } from "../../core/text-control.js";

const languageDialogStylesheetId = "language-dialog-control-stylesheet";
const languageDialogStylesheetHref =
  "./explorer/controls/dialog/content/language-dialog.css";

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

  protected stylesheets() {
    return [
      {
        href: languageDialogStylesheetHref,
        id: languageDialogStylesheetId,
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
