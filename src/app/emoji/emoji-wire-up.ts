type AddEventBound = (
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | undefined,
) => void;
type EditEventBound = (
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: EventListenerOptions | undefined,
) => void;
type Bindable = {
  addEventListener: AddEventBound;
  removeEventListener: EditEventBound;
};
type Binder = {
  (
    el: Bindable | undefined,
    handler: EventListenerOrEventListenerObject,
  ): () => void;
};

type BinderBase = {
  (
    type: string,
    el: Bindable | undefined,
    handler: EventListenerOrEventListenerObject,
  ): () => void;
};

const noop = () => {};

export const bindEvent: BinderBase = (type, el, handler) => {
  if (!el) return noop;
  el.addEventListener(type, handler);
  return () => el.removeEventListener(type, handler);
};
export const click: Binder = (el, ha) => bindEvent("click", el, ha);
export const change: Binder = (el, ha) => bindEvent("change", el, ha);
export const input: Binder = (el, ha) => bindEvent("input", el, ha);
export const close: Binder = (el, ha) => bindEvent("close", el, ha);
export const focusIn: Binder = (el, ha) => bindEvent("focusin", el, ha);
export const keyDown: Binder = (el, ha) => bindEvent("keydown", el, ha);
export const online: Binder = (el, ha) => bindEvent("online", el, ha);
export const offline: Binder = (el, ha) => bindEvent("offline", el, ha);
