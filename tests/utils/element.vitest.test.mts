import { describe, expect, it } from "vitest";

import {
  classifyElement,
  isButton,
  isCheckbox,
  isDropdown,
  isInput,
  isLink,
  isRadio,
} from "../../src/utils/element.js";

type FakeElement = {
  tagName?: string;
  type?: string;
  getAttribute: (name: string) => string | null;
};

const createElement = (
  tagName = "DIV",
  attributes: Record<string, string> = {},
  type?: string,
): FakeElement => ({
  tagName,
  type,
  getAttribute(name: string) {
    return attributes[name] ?? null;
  },
});

describe("utils/element", () => {
  it("classifies supported element kinds", () => {
    const select = createElement("SELECT");
    expect(isDropdown(select as HTMLElement)).toBe(true);
    expect(classifyElement(select as HTMLElement)).toBe("dropdown");

    const listbox = createElement("DIV", { "aria-haspopup": "listbox" });
    expect(isDropdown(listbox as HTMLElement)).toBe(true);

    const checkbox = createElement("INPUT", {}, "checkbox");
    expect(isInput(checkbox as HTMLElement)).toBe(true);
    expect(isCheckbox(checkbox as HTMLElement)).toBe(true);
    expect(classifyElement(checkbox as HTMLElement)).toBe("checkbox");

    const switchRole = createElement("DIV", { role: "switch" });
    expect(isCheckbox(switchRole as HTMLElement)).toBe(true);

    const radio = createElement("INPUT", {}, "radio");
    expect(isRadio(radio as HTMLElement)).toBe(true);
    expect(classifyElement(radio as HTMLElement)).toBe("radio");

    const roleRadio = createElement("DIV", { role: "radio" });
    expect(isRadio(roleRadio as HTMLElement)).toBe(true);

    const link = createElement("A");
    expect(isLink(link as HTMLElement)).toBe(true);
    expect(classifyElement(link as HTMLElement)).toBe("link");

    const roleLink = createElement("DIV", { role: "link" });
    expect(isLink(roleLink as HTMLElement)).toBe(true);

    const button = createElement("BUTTON");
    expect(isButton(button as HTMLElement)).toBe(true);
    expect(classifyElement(button as HTMLElement)).toBe("button");

    const roleButton = createElement("DIV", { role: "button" });
    expect(isButton(roleButton as HTMLElement)).toBe(true);

    const generic = createElement();
    expect(isInput(generic as HTMLElement)).toBe(false);
    expect(isDropdown(generic as HTMLElement)).toBe(false);
    expect(isCheckbox(generic as HTMLElement)).toBe(false);
    expect(isRadio(generic as HTMLElement)).toBe(false);
    expect(isLink(generic as HTMLElement)).toBe(false);
    expect(isButton(generic as HTMLElement)).toBe(false);
    expect(classifyElement(generic as HTMLElement)).toBe("generic");
  });
});
