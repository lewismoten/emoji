import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";
import { DialogHeadingControl } from "./dialog-heading.js";

type DialogControlState = {
  bodyClassName?: string;
  children?: NodeSpec[];
  className: string;
  dialogId: string;
  eyebrow?: string;
  eyebrowKey?: string;
  headingClassName?: string;
  headingContentClassName?: string;
  headingControlsClassName?: string;
  title: string;
  titleId: string;
  titleKey: string;
};

export class DialogControl extends BaseControl<DialogControlState> {
  constructor(state: DialogControlState) {
    super(state);
  }

  static toSpec(state: DialogControlState) {
    return new DialogControl(state).render();
  }

  protected childControls() {
    return [this.createHeadingControl()];
  }

  private createHeadingControl() {
    return new DialogHeadingControl({
      className: this.state.headingClassName,
      closeButtonClassName: this.state.headingControlsClassName,
      contentClassName: this.state.headingContentClassName,
      eyebrow: this.state.eyebrow,
      eyebrowKey: this.state.eyebrowKey,
      title: this.state.title,
      titleId: this.state.titleId,
      titleKey: this.state.titleKey,
    });
  }

  private createChildren() {
    if (!this.state.bodyClassName) return this.state.children ?? [];
    return [
      DomFactory.element("div", {
        children: this.state.children,
        className: this.state.bodyClassName,
      }),
    ];
  }

  protected render() {
    return DomFactory.element("dialog", {
      attributes: {
        "aria-labelledby": this.state.titleId,
        id: this.state.dialogId,
      },
      children: [
        DialogHeadingControl.toSpec({
          className: this.state.headingClassName,
          closeButtonClassName: this.state.headingControlsClassName,
          contentClassName: this.state.headingContentClassName,
          eyebrow: this.state.eyebrow,
          eyebrowKey: this.state.eyebrowKey,
          title: this.state.title,
          titleId: this.state.titleId,
          titleKey: this.state.titleKey,
        }),
        ...this.createChildren(),
      ],
      className: this.state.className,
    });
  }
}
