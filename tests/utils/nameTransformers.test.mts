import assert from "node:assert/strict";
import { pascalToDashed } from "../../src/utils/nameTransformers.js";

assert.equal(pascalToDashed("i18n"), "i18n");
assert.equal(pascalToDashed("i18nPlaceholder"), "i18n-placeholder");
assert.equal(pascalToDashed("HTMLParser"), "htmlparser");
assert.equal(pascalToDashed("theme2Color"), "theme2-color");
assert.equal(pascalToDashed("parse2HTMLNow"), "parse2-htmlnow");
