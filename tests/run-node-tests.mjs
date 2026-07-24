import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.argv[2] ?? "build/tests");
const testPattern = /\.test\.(?:js|mjs|cjs)$/;
const maximumDurationMs = 200;

function findTests(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findTests(file)
        : testPattern.test(entry.name)
          ? [file]
          : [];
    })
    .sort();
}

const tests = findTests(root);
if (tests.length === 0) {
  console.error(`No compiled Node tests found under ${root}`);
  process.exitCode = 1;
} else {
  const failures = [];
  for (const test of tests) {
    const result = spawnSync(process.execPath, ["--test", test], {
      encoding: "utf8",
    });
    if (result.error) throw result.error;
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    if (result.status !== 0) {
      failures.push(`${test} failed`);
      continue;
    }
    const durationMatches = [
      ...result.stdout.matchAll(/^ℹ duration_ms ([\d.]+)$/gm),
    ];
    const duration = Number(durationMatches.at(-1)?.[1]);
    if (!Number.isFinite(duration)) {
      failures.push(`${test} did not report its duration`);
    } else if (duration > maximumDurationMs) {
      failures.push(
        `${test} took ${duration.toFixed(1)} ms; limit is ${maximumDurationMs} ms`,
      );
    }
  }
  if (failures.length > 0) {
    console.error(`Node test limits failed:\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}
