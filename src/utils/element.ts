import * as aria from "./aria.js";

const hasTag = (el: HTMLElement, tagName: string) =>
  el.tagName?.toUpperCase() === tagName.toUpperCase();

const hasRole = (el: HTMLElement, name: string) =>
  el.getAttribute("role") === name;

export const isInput = (el: HTMLElement): el is HTMLInputElement =>
  hasTag(el, "INPUT");
const isInputType = (el: HTMLElement, type: string) =>
  isInput(el) && el.type === type;
const isSelect = (el: HTMLElement) => hasTag(el, "SELECT");
export const isDropdown = (el: HTMLElement) =>
  isSelect(el) || aria.hasPopupListbox(el);
export const isCheckbox = (el: HTMLElement) =>
  isInputType(el, "checkbox") ||
  hasRole(el, "checkbox") ||
  hasRole(el, "switch");
export const isRadio = (el: HTMLElement) =>
  isInputType(el, "radio") || hasRole(el, "radio");
export const isLink = (el: HTMLElement) =>
  hasTag(el, "A") || hasRole(el, "link");
export const isButton = (el: HTMLElement) =>
  hasTag(el, "BUTTON") || hasRole(el, "button");

export const classifyElement = (
  el: HTMLElement,
): "dropdown" | "checkbox" | "radio" | "link" | "button" | "generic" => {
  if (isDropdown(el)) return "dropdown";
  if (isCheckbox(el)) return "checkbox";
  if (isRadio(el)) return "radio";
  if (isLink(el)) return "link";
  if (isButton(el)) return "button";
  return "generic";
};
