export const setDisabled = (el: Element | null, value: boolean) => {
  el?.setAttribute("aria-disabled", String(value));
};
export const setChecked = (el: Element | null, value: boolean) => {
  el?.setAttribute("aria-checked", String(value));
};
export const setPressed = (el: Element | null, value: boolean) => {
  el?.setAttribute("aria-pressed", String(value));
};
export const isDisabled = (el: Element | null) =>
  el?.getAttribute("aria-disabled") === "true";
export const isChecked = (el: Element | null) =>
  el?.getAttribute("aria-checked") === "true";
export const isPressed = (el: Element | null) =>
  el?.getAttribute("aria-pressed") === "true";
export const hasPopupListbox = (el: Element | null) =>
  el?.getAttribute("aria-haspopup") === "listbox";
export const label = (el: Element | null) =>
  el?.getAttribute("aria-label") ?? "";
export const setLabel = (el: Element | null, value: string) => {
  el?.setAttribute("aria-label", value);
};
