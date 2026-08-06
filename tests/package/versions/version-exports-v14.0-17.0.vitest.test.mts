import { describe, it } from "vitest";

import { verifyVersionContract } from "./version-exports-shared.mjs";

describe("version-exports-v14.0-17.0", () => {
  it("keeps recent-version export contracts stable", async () => {
    for (const version of ["14.0", "15.0", "15.1", "16.0", "17.0"]) {
      await verifyVersionContract(version);
    }
  });
});
