import { DialogCloseButtonControl } from "../controls/dialog-close-button.js";

declare const document: {
  createElement(tagName: string): any;
};

export function createHeading(
  level: "h2" | "h3" | "h4",
  key: string,
  text: string,
) {
  const heading = document.createElement(level);
  heading.dataset.i18n = key;
  heading.textContent = text;
  return heading;
}

export function createTextBlock(
  tagName: "p" | "span",
  key: string,
  text: string,
) {
  const element = document.createElement(tagName);
  element.dataset.i18n = key;
  element.textContent = text;
  return element;
}

export function createDialogHeading(options: {
  titleId: string;
  titleKey: string;
  title: string;
  eyebrowKey?: string;
  eyebrow?: string;
}) {
  const heading = document.createElement("div");
  heading.className = "dialog-heading";
  const content = document.createElement("div");
  if (options.eyebrowKey && options.eyebrow) {
    const eyebrow = createTextBlock("p", options.eyebrowKey, options.eyebrow);
    eyebrow.className = "eyebrow";
    content.append(eyebrow);
  }
  const title = createHeading("h2", options.titleKey, options.title);
  title.id = options.titleId;
  content.append(title);
  heading.append(content, DialogCloseButtonControl.create());
  return heading;
}

export function setPressedState(
  element: any,
  selected: boolean,
  className = "is-selected",
) {
  element.classList.toggle(className, selected);
  element.setAttribute("aria-pressed", String(selected));
}
