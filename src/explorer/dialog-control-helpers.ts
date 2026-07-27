import { DialogHeadingControl } from "../controls/dialog-heading.js";
import { TextControl } from "../controls/text-control.js";

declare const document: {
  createElement(tagName: string): any;
};

export function createHeading(
  level: "h2" | "h3" | "h4",
  key: string,
  text: string,
) {
  return TextControl.create({
    i18nKey: key,
    tag: level,
    text,
  });
}

export function createTextBlock(
  tagName: "p" | "span",
  key: string,
  text: string,
) {
  return TextControl.create({
    i18nKey: key,
    tag: tagName,
    text,
  });
}

export function createDialogHeading(options: {
  titleId: string;
  titleKey: string;
  title: string;
  eyebrowKey?: string;
  eyebrow?: string;
}) {
  return DialogHeadingControl.create(options);
}

export function setPressedState(
  element: any,
  selected: boolean,
  className = "is-selected",
) {
  element.classList.toggle(className, selected);
  element.setAttribute("aria-pressed", String(selected));
}
