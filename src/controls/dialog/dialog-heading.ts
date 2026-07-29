import { BaseControl } from "../core/base-control.js";
import {
  DialogCloseButtonControl,
  dialogCloseButtonClassName,
} from "./dialog-close-button.js";
import { DomFactory } from "../core/dom-factory.js";
import { TextControl } from "../core/text-control.js";

const dialogHeadingStylesheetId = "dialog-heading-control-stylesheet";
const dialogHeadingStylesheetHref =
  "./explorer/controls/dialog/dialog-heading.css";

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
    ];
  }

  protected childControls() {
    return [this.createCloseButtonControl()];
  }

  private createCloseButtonControl() {
    return new DialogCloseButtonControl({
      buttonClassName:
        this.state.closeButtonClassName ?? dialogCloseButtonClassName,
    });
  }

  private createCloseButtonSpec() {
    return DialogCloseButtonControl.toSpec({
      buttonClassName:
        this.state.closeButtonClassName ?? dialogCloseButtonClassName,
    });
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
          children: [this.createCloseButtonSpec()],
          className: "dialog-controls",
        }),
      ],
      className: this.state.className ?? "dialog-heading",
    });
  }
}
