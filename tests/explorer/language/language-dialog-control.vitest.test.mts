import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

import {
  buildLanguageOption,
  createLanguageDialogControl,
  createLanguagePickerControl,
  getLocalizedLanguageName,
} from "../../../src/explorer/language/language-dialog-control.js";
import {
  assertIntlFallbackCases,
  assertLocalizedLanguageCases,
} from "./fixtures/language-dialog-control-cases.mjs";
import {
  FakeElement,
  installLanguageDialogFixture,
  restoreLanguageDialogFixture,
} from "./fixtures/language-dialog-control-fixture.mjs";

installLanguageDialogFixture();

afterAll(() => {
  restoreLanguageDialogFixture();
});

describe("language-dialog-control", () => {
  it("builds the picker and dialog controls", async () => {
    const picker = await createLanguagePickerControl();
    const dialogControl = await createLanguageDialogControl();
    assert.equal(picker.button.tagName, "BUTTON");
    assert.equal(picker.button.getAttribute("aria-haspopup"), "dialog");
    assert.equal(picker.button.getAttribute("aria-controls"), "language-dialog");
    assert.equal(
      picker.button.getAttribute("aria-labelledby"),
      "language-picker-accessible-label language-picker-current-label",
    );
    assert.equal(picker.flag.textContent, "🌐");
    assert.equal(picker.label.textContent, "Language");

    assert.equal(dialogControl.dialog.tagName, "DIALOG");
    assert.equal(dialogControl.dialog.className, "dialog language-dialog");
    assert.equal(dialogControl.dialog.id, "language-dialog");
    assert.equal(
      dialogControl.dialog.getAttribute("aria-labelledby"),
      "language-title",
    );
    assert.equal(dialogControl.dialog.children.length, 3);
    assert.equal(dialogControl.dialog.children[1].tagName, "P");
    assert.equal(
      dialogControl.dialog.children[1].className,
      "dialog-description",
    );
    assert.equal(
      dialogControl.dialog.children[1].textContent,
      "Choose a language for emoji search.",
    );
    assert.equal(dialogControl.list.className, "language-list");
    assert.equal(dialogControl.list.getAttribute("role"), "radiogroup");
    assert.equal(
      dialogControl.list.getAttribute("aria-labelledby"),
      "language-title",
    );
  });

  it("builds clickable language options with correct pressed state", () => {
    const clicks: any[] = [];
    const selectedOption = buildLanguageOption({
      flag: "🇸🇦",
      label: "Arabic",
      href: "./index.ar.html",
      selected: true,
      locale: "ar",
      onSelectLanguageLink: async (event, locale, href) => {
        clicks.push({ event, locale, href });
      },
    }) as any;
    assert.equal(selectedOption.className, "language-option is-selected");
    assert.equal(selectedOption.getAttribute("role"), "radio");
    assert.equal(selectedOption.getAttribute("aria-checked"), "true");
    assert.equal(selectedOption.getAttribute("aria-pressed"), "true");
    assert.equal(selectedOption.tabIndex, 0);
    assert.equal(selectedOption.children[0].tagName, "INPUT");
    assert.equal(selectedOption.children[0].type, "radio");
    assert.equal(selectedOption.children[0].name, "language-choice");
    assert.equal(selectedOption.children[0].value, "ar");
    assert.equal(selectedOption.children[0].checked, true);
    assert.equal(selectedOption.children[0].tabIndex, -1);
    assert.equal(selectedOption.children[1].textContent, "🇸🇦");
    assert.equal(selectedOption.children[1].getAttribute("aria-hidden"), "true");
    assert.equal(selectedOption.children[2].textContent, "Arabic");
    selectedOption.dispatch("click", { type: "click" });
    assert.deepEqual(clicks[0], {
      event: { type: "click" },
      locale: "ar",
      href: "./index.ar.html",
    });
    assert.equal(selectedOption.children.length, 3);
    assert.equal(selectedOption.listeners.get("click")?.length, 1);

    const unselectedOption = buildLanguageOption({
      flag: "🇬🇧",
      label: "English",
      href: "./index.en.html",
      selected: false,
      locale: "en",
      onSelectLanguageLink: async (event, locale, href) => {
        clicks.push({ event, locale, href });
      },
    }) as any;
    assert.equal(unselectedOption.getAttribute("aria-checked"), "false");
    assert.equal(unselectedOption.getAttribute("aria-pressed"), "false");
    assert.equal(unselectedOption.tabIndex, -1);
    assert.equal(unselectedOption.children[0].checked, false);
    assert.equal(unselectedOption.children.length, 3);
    assert.equal(unselectedOption.listeners.get("click")?.length, 1);
    unselectedOption.dispatch("click", { type: "click-unselected" });
    assert.deepEqual(clicks[1], {
      event: { type: "click-unselected" },
      locale: "en",
      href: "./index.en.html",
    });
  });

  it("localizes language labels across ui locales and fallbacks", () => {
    assertLocalizedLanguageCases(getLocalizedLanguageName);
  });

  it("falls back when Intl.DisplayNames is unsupported or needs base locale fallback", () => {
    assertIntlFallbackCases(getLocalizedLanguageName);
  });
});
