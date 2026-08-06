import { describe, it } from "vitest";

import {
  verifyAllEmojiContract,
  verifyVersionContract,
} from "./version-exports-shared.mjs";

describe("version-exports-v0.6-5.0", () => {
  it("keeps all and early-version export contracts stable", async () => {
    await verifyAllEmojiContract();
    for (const version of ["0.6", "0.7", "1.0", "2.0", "3.0", "4.0", "5.0"]) {
      await verifyVersionContract(version);
    }
  });
});
