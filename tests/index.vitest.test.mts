import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "vitest";

describe("index", () => {
  it("keeps src/index.ts as a direct explorer-entry side-effect import", async () => {
    const moduleSpecifier = "../src/index.js";
    const source = await fs.readFile(
      path.join(process.cwd(), "src/index.ts"),
      "utf8",
    );

    assert.equal(moduleSpecifier, "../src/index.js");
    assert.match(source, /^import "\.\/explorer-entry\.js";\s*$/);
  });
});
