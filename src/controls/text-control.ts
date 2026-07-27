import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

type TextControlState = {
  tag: string;
  text: string;
  i18nKey?: string;
  className?: string;
  id?: string;
  requireI18n?: boolean;
};

export class TextControl extends BaseControl<TextControlState> {
  constructor(state: TextControlState) {
    super(state);
  }

  protected render() {
    return DomFactory.element(this.state.tag, {
      attributes: this.state.id ? { id: this.state.id } : undefined,
      className: this.state.className,
      dataset: this.state.i18nKey ? { i18n: this.state.i18nKey } : undefined,
      requireI18n: this.state.requireI18n ?? Boolean(this.state.i18nKey),
      text: this.state.text,
    });
  }

  renderForParent() {
    return this.render();
  }
}
