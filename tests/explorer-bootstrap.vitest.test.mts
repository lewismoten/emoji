import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "vitest";

describe("explorer-bootstrap", () => {
  it("keeps the bootstrap entry focused on session startup", async () => {
    const moduleSpecifier = "../src/explorer-bootstrap.js";
    const source = await fs.readFile(
      path.join(process.cwd(), "src/explorer-bootstrap.ts"),
      "utf8",
    );

    assert.equal(moduleSpecifier, "../src/explorer-bootstrap.js");
    assert.match(
      source,
      /^import "\.\/app\/bootstrap\/explorer-bootstrap-session\.js";\s*$/,
    );
  });
});
