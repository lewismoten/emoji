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

  static create<TState, TControl extends BaseControl<TState>>(
    this: new (state?: Partial<TState>) => TControl,
    state?: Partial<TState>,
  ) {
    return new this(state).create();
  }

  static toMarkup<TState, TControl extends BaseControl<TState>>(
    this: new (state?: Partial<TState>) => TControl,
    state?: Partial<TState>,
  ) {
    return new this(state).toMarkup();
  }

  protected abstract render(): NodeSpec;
}
