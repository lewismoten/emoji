import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

const languagePickerStylesheetId = "language-picker-control-stylesheet";
const languagePickerStylesheetHref = "./explorer/controls/language-picker.css";

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

  protected stylesheets() {
    return [
      {
        href: languagePickerStylesheetHref,
        id: languagePickerStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controlsId,
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
