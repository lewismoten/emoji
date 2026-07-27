import { DomFactory, type NodeSpec } from "./dom-factory.js";

export abstract class BaseControl<TState> {
  protected state: TState;

  constructor(state: TState) {
    this.state = state;
  }

  update(next: Partial<TState>) {
    this.state = { ...this.state, ...next };
    return this;
  }

  create() {
    return DomFactory.createElement(this.render());
  }

  toMarkup() {
    return DomFactory.toMarkup(this.render());
  }

  static create(this: any, state?: any) {
    return new this(state).create();
  }

  static toMarkup(this: any, state?: any) {
    return new this(state).toMarkup();
  }

  protected abstract render(): NodeSpec;
}
