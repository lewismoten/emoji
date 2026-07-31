import assert from "node:assert/strict";
import {
  renderSearchLanguages,
  selectLanguageLink,
  setSearchLanguage,
} from "../../../src/explorer/language/search-language-picker.js";

assert.equal(typeof renderSearchLanguages, "function");
assert.equal(typeof selectLanguageLink, "function");
assert.equal(typeof setSearchLanguage, "function");
