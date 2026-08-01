import assert from "node:assert/strict";
import { FakeElement } from "./explorer-audio-direct-fixture.mjs";

export function createAudioTargets() {
  const buttonInteractive = new FakeElement([], null);
  buttonInteractive.tagName = "BUTTON";
  const checkboxInteractive = new FakeElement([], null);
  checkboxInteractive.tagName = "DIV";
  checkboxInteractive.setAttribute("role", "checkbox");
  const radioInteractive = new FakeElement([], null);
  radioInteractive.tagName = "DIV";
  radioInteractive.setAttribute("role", "radio");
  const linkInteractive = new FakeElement([], null);
  linkInteractive.tagName = "A";
  const disabledInteractive = new FakeElement([], null);
  disabledInteractive.disabled = true;
  const ariaDisabledInteractive = new FakeElement([], null);
  ariaDisabledInteractive.setAttribute("aria-disabled", "true");
  const roleButtonInteractive = new FakeElement([], null);
  roleButtonInteractive.tagName = "DIV";
  roleButtonInteractive.setAttribute("role", "button");
  const switchInteractive = new FakeElement([], null);
  switchInteractive.tagName = "DIV";
  switchInteractive.setAttribute("role", "switch");
  switchInteractive.setAttribute("aria-checked", "false");
  const roleLinkInteractive = new FakeElement([], null);
  roleLinkInteractive.tagName = "DIV";
  roleLinkInteractive.setAttribute("role", "link");
  const dropdownInteractive = new FakeElement([], null);
  dropdownInteractive.tagName = "DIV";
  dropdownInteractive.setAttribute("aria-haspopup", "listbox");
  const selectInteractive = new FakeElement([], null);
  selectInteractive.tagName = "SELECT";
  const radioInputInteractive = new FakeElement([], null);
  radioInputInteractive.tagName = "INPUT";
  radioInputInteractive.type = "radio";
  const checkboxInputInteractive = new FakeElement([], null);
  checkboxInputInteractive.tagName = "INPUT";
  checkboxInputInteractive.type = "checkbox";
  const genericInteractive = new FakeElement([], null);

  return {
    ariaDisabledTarget: new FakeElement([], ariaDisabledInteractive),
    buttonTarget: new FakeElement([], buttonInteractive),
    checkboxInputTarget: new FakeElement([], checkboxInputInteractive),
    checkboxTarget: new FakeElement([], checkboxInteractive),
    disabledTarget: new FakeElement([], disabledInteractive),
    dropdownTarget: new FakeElement([], dropdownInteractive),
    genericTarget: new FakeElement([], genericInteractive),
    linkTarget: new FakeElement([], linkInteractive),
    radioInputTarget: new FakeElement([], radioInputInteractive),
    radioTarget: new FakeElement([], radioInteractive),
    roleButtonTarget: new FakeElement([], roleButtonInteractive),
    roleLinkTarget: new FakeElement([], roleLinkInteractive),
    selectTarget: new FakeElement([], selectInteractive),
    switchTarget: new FakeElement([], switchInteractive),
  };
}

export function createWrappedPreferenceTarget(
  preference: "soundEffects" | "music",
  checked: boolean,
) {
  const target = new FakeElement([], null);
  target.tagName = "DIV";
  target.checked = checked;
  target.setAttribute("role", "switch");
  target.closest = () => ({
    matches: (selector: string) =>
      selector === `[data-audio-preference="${preference}"]`,
  } as any);
  return target;
}

export function assertHasInteraction(
  engineCalls: Array<unknown[]>,
  element: string,
  action: string,
) {
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" && call[1] === element && call[2] === action,
    ),
    true,
  );
}
