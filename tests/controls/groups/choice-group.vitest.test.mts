import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ChoiceGroupControl } from "../../../src/controls/groups/choice-group.js";

describe("choice-group", () => {
  it("renders checkbox and radio choice groups", () => {
    const markup = ChoiceGroupControl.toMarkup({
      buttonClassName: "choice-button",
      className: "choice-group",
      inputClassName: "choice-input",
      inputType: "checkbox",
      items: [
        {
          ariaLabel: "One",
          emoji: "1️⃣",
          label: "One",
          labelKey: "one",
          selected: true,
          value: "one",
        },
        {
          ariaLabel: "Two",
          emoji: "2️⃣",
          label: "Two",
          labelKey: "two",
          selected: false,
          value: "two",
        },
      ],
      label: "Numbers",
      labelKey: "numbers",
      maxSelectable: 1,
      minSelectable: 1,
      wrapperTag: "fieldset",
    });

    assert.ok(
      markup.includes(
        '<fieldset class="choice-group" data-max-selectable="1" data-min-selectable="1">',
      ),
    );
    assert.ok(
      markup.includes(
        '<legend id="numbers-group-label" data-i18n="numbers">Numbers</legend>',
      ),
    );
    assert.ok(markup.includes('class="choice-button"'));
    assert.ok(markup.includes('data-disabled="true"'));
    assert.ok(markup.includes('data-disabled="false"'));

    const radioMarkup = ChoiceGroupControl.toMarkup({
      buttonClassName: "theme-choice",
      className: "theme-choices",
      inputClassName: "theme-input",
      inputName: "theme",
      inputType: "radio",
      items: [
        {
          ariaLabel: "Light theme",
          className: "is-light",
          dataAttributes: { theme: "light" },
          emoji: "☀️",
          label: "Light",
          selected: false,
          title: "Switch to light",
          value: "light",
        },
        {
          ariaLabel: "Dark theme",
          dataAttributes: { theme: "dark" },
          emoji: "🌙",
          label: "Dark",
          selected: true,
          value: "dark",
        },
      ],
      label: "Theme",
      role: "radiogroup",
    });

    assert.ok(radioMarkup.includes('class="theme-choices"'));
    assert.ok(radioMarkup.includes('aria-label="Theme"'));
    assert.ok(radioMarkup.includes('role="radiogroup"'));
    assert.ok(radioMarkup.includes('class="theme-choice is-light"'));
    assert.ok(radioMarkup.includes('data-theme="light"'));
    assert.ok(radioMarkup.includes('title="Switch to light"'));
    assert.ok(radioMarkup.includes('tabindex="0"'));
    assert.ok(radioMarkup.includes('tabindex="-1"'));
  });
});
