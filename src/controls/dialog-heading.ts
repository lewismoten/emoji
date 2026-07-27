import { BaseControl } from "./base-control.js";
import { DialogCloseButtonControl } from "./dialog-close-button.js";
import { DomFactory } from "./dom-factory.js";
import { TextControl } from "./text-control.js";

const dialogHeadingStylesheetId = "dialog-heading-control-stylesheet";
const dialogHeadingStylesheetHref = "./explorer/controls/dialog-heading.css";
const dialogCloseButtonStylesheetId =
  "dialog-close-button-control-stylesheet";
const dialogCloseButtonStylesheetHref =
  "./explorer/controls/dialog-close-button.css";

type DialogHeadingState = {
  titleId: string;
  titleKey: string;
  title: string;
  eyebrowKey?: string;
  eyebrow?: string;
  className?: string;
  contentClassName?: string;
  closeButtonClassName?: string;
};

export class DialogHeadingControl extends BaseControl<DialogHeadingState> {
  constructor(state: DialogHeadingState) {
    super(state);
  }

  static toSpec(state: DialogHeadingState) {
    return new DialogHeadingControl(state).render();
  }

  protected stylesheets() {
    return [
      {
        href: dialogHeadingStylesheetHref,
        id: dialogHeadingStylesheetId,
      },
      {
        href: dialogCloseButtonStylesheetHref,
        id: dialogCloseButtonStylesheetId,
      },
    ];
  }

  protected render() {
    const contentChildren = [];
    if (this.state.eyebrowKey && this.state.eyebrow) {
      contentChildren.push(
        new TextControl({
          className: "eyebrow",
          i18nKey: this.state.eyebrowKey,
          tag: "p",
          text: this.state.eyebrow,
        }).renderForParent(),
      );
    }
    contentChildren.push(
      new TextControl({
        i18nKey: this.state.titleKey,
        id: this.state.titleId,
        tag: "h2",
        text: this.state.title,
      }).renderForParent(),
    );
    return DomFactory.element("div", {
      children: [
        DomFactory.element("div", {
          children: contentChildren,
          className: this.state.contentClassName ?? "dialog-title-row",
        }),
        DomFactory.element("div", {
          children: [
            DialogCloseButtonControl.toSpec({
              buttonClassName:
                this.state.closeButtonClassName ?? "dialog-close",
            }),
          ],
          className: "dialog-controls",
        }),
      ],
      className: this.state.className ?? "dialog-heading",
    });
  }
}
