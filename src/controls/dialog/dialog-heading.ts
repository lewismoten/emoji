import { BaseControl } from "../core/base-control.js";
import {
  DialogCloseButtonControl,
  dialogCloseButtonClassName,
} from "./dialog-close-button.js";
import { DomFactory } from "../core/dom-factory.js";
import { TextControl } from "../core/text-control.js";

const dialogHeadingStyleId = "dialog-heading-control-style";
const dialogHeadingStyleText = `
.dialog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.8rem 1rem;
  background: var(--panel-strong);
}

.dialog-heading > :first-child,
.dialog-title-row,
.dialog-title-row h2 {
  min-width: 0;
}

.dialog-title-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.eyebrow {
  margin: 0 0 0.2rem;
  color: var(--accent-strong);
  font-size: var(--ui-font-size-x-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.dialog-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dialog-controls form {
  margin: 0;
}
`;

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

  protected styles() {
    return [
      {
        id: dialogHeadingStyleId,
        text: dialogHeadingStyleText,
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
