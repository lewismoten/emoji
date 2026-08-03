import assert from "node:assert/strict";
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

const select = createElement("SELECT");
assert.equal(isDropdown(select as HTMLElement), true);
assert.equal(classifyElement(select as HTMLElement), "dropdown");

const listbox = createElement("DIV", { "aria-haspopup": "listbox" });
assert.equal(isDropdown(listbox as HTMLElement), true);

const checkbox = createElement("INPUT", {}, "checkbox");
assert.equal(isInput(checkbox as HTMLElement), true);
assert.equal(isCheckbox(checkbox as HTMLElement), true);
assert.equal(classifyElement(checkbox as HTMLElement), "checkbox");

const switchRole = createElement("DIV", { role: "switch" });
assert.equal(isCheckbox(switchRole as HTMLElement), true);

const radio = createElement("INPUT", {}, "radio");
assert.equal(isRadio(radio as HTMLElement), true);
assert.equal(classifyElement(radio as HTMLElement), "radio");

const roleRadio = createElement("DIV", { role: "radio" });
assert.equal(isRadio(roleRadio as HTMLElement), true);

const link = createElement("A");
assert.equal(isLink(link as HTMLElement), true);
assert.equal(classifyElement(link as HTMLElement), "link");

const roleLink = createElement("DIV", { role: "link" });
assert.equal(isLink(roleLink as HTMLElement), true);

const button = createElement("BUTTON");
assert.equal(isButton(button as HTMLElement), true);
assert.equal(classifyElement(button as HTMLElement), "button");

const roleButton = createElement("DIV", { role: "button" });
assert.equal(isButton(roleButton as HTMLElement), true);

const generic = createElement();
assert.equal(isInput(generic as HTMLElement), false);
assert.equal(isDropdown(generic as HTMLElement), false);
assert.equal(isCheckbox(generic as HTMLElement), false);
assert.equal(isRadio(generic as HTMLElement), false);
assert.equal(isLink(generic as HTMLElement), false);
assert.equal(isButton(generic as HTMLElement), false);
assert.equal(classifyElement(generic as HTMLElement), "generic");
