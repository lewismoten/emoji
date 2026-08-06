import fs from "node:fs/promises";

const targets = ["build", "dist"];
const attempts = 5;
const delayMs = 200;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const removeTarget = async (target) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await fs.rm(target, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 100,
      });
      return;
    } catch (error) {
      if (
        attempt === attempts ||
        !(error instanceof Error) ||
        !("code" in error) ||
        !["ENOTEMPTY", "EBUSY", "EPERM"].includes(error.code)
      ) {
        throw error;
      }
      await wait(delayMs * attempt);
    }
  }
};

for (const target of targets) {
  await removeTarget(target);
}
