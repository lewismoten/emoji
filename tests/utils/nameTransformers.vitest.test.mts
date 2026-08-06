import { describe, expect, it } from "vitest";

import { pascalToDashed } from "../../src/utils/nameTransformers.js";

describe("utils/nameTransformers", () => {
  it("converts camel and pascal segments into dashed names", () => {
    expect(pascalToDashed("i18n")).toBe("i18n");
    expect(pascalToDashed("i18nPlaceholder")).toBe("i18n-placeholder");
    expect(pascalToDashed("HTMLParser")).toBe("htmlparser");
    expect(pascalToDashed("theme2Color")).toBe("theme2-color");
    expect(pascalToDashed("parse2HTMLNow")).toBe("parse2-htmlnow");
  });
});
