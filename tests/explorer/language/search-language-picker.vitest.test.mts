import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  renderSearchLanguages,
  selectLanguageLink,
  setSearchLanguage,
} from "../../../src/explorer/language/search-language-picker.js";

describe("search-language-picker", () => {
  it("exports the picker api", () => {
    assert.equal(typeof renderSearchLanguages, "function");
    assert.equal(typeof selectLanguageLink, "function");
    assert.equal(typeof setSearchLanguage, "function");
  });
});
