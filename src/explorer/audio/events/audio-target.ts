import * as aria from '../../../utils/aria.js';

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "select",
  "input",
  "label",
  "[tabindex]",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="switch"]',
  '[aria-haspopup="listbox"]',
  ".modifier-filter-option",
  ".setting-choice",
  ".theme-choice",
  ".mode-choice",
  ".audio-choice",
  ".emoji-font-choice",
  ".language-option",
  ".saved-picker",
  ".help-picker",
  ".order-mode",
  ".compact-choice",
  ".version-mode-toggle",
  ".version-step",
  ".filter-picker-trigger",
  "[data-emoji-key]",
].join(", ");

const getInteractiveTarget = (
    target: EventTarget | null,
  ): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!(interactive instanceof HTMLElement)) return null;
    if ("disabled" in interactive && interactive.disabled) return null;
    if (aria.isDisabled(interactive)) return null;
    return interactive;
  };

export default getInteractiveTarget;