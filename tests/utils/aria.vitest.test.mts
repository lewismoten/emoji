import { describe, expect, it } from "vitest";

import {
  hasPopupListbox,
  isChecked,
  isDisabled,
  isPressed,
  label,
  setChecked,
  setDisabled,
  setLabel,
  setPressed,
} from "../../src/utils/aria.js";

describe("utils/aria", () => {
  it("reads and writes aria state safely", () => {
    const attributes = new Map<string, string>();
    const element = {
      getAttribute(name: string) {
        return attributes.get(name) ?? null;
      },
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
    };

    setDisabled(element as Element, true);
    setChecked(element as Element, true);
    setPressed(element as Element, false);
    setLabel(element as Element, "Theme");
    element.setAttribute("aria-haspopup", "listbox");

    expect(isDisabled(element as Element)).toBe(true);
    expect(isChecked(element as Element)).toBe(true);
    expect(isPressed(element as Element)).toBe(false);
    expect(label(element as Element)).toBe("Theme");
    expect(hasPopupListbox(element as Element)).toBe(true);
    expect(isDisabled(null)).toBe(false);
    expect(isChecked(null)).toBe(false);
    expect(isPressed(null)).toBe(false);
    expect(hasPopupListbox(null)).toBe(false);
    expect(label(null)).toBe("");
    expect(() => setDisabled(null, true)).not.toThrow();
    expect(() => setChecked(null, true)).not.toThrow();
    expect(() => setPressed(null, true)).not.toThrow();
    expect(() => setLabel(null, "ignored")).not.toThrow();
  });
});
