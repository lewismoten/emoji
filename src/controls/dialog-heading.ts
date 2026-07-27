import { BaseControl } from "./base-control.js";
import { DialogCloseButtonControl } from "./dialog-close-button.js";
import { DomFactory } from "./dom-factory.js";
import { TextControl } from "./text-control.js";

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
          className: this.state.contentClassName,
        }),
        DialogCloseButtonControl.toSpec({
          buttonClassName:
            this.state.closeButtonClassName ?? "dialog-close",
        }),
      ],
      className: this.state.className ?? "dialog-heading",
    });
  }
}
