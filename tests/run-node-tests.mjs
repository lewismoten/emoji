import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { availableParallelism } from "node:os";

const root = path.resolve(process.argv[2] ?? "build/tests");
const testPattern = /\.test\.(?:js|mjs|cjs)$/;
const maximumDurationMs = 200;
const coverageEnabled = process.env.TEST_COVERAGE !== "0";
const effectiveMaximumDurationMs = coverageEnabled ? 300 : maximumDurationMs;
const requestedConcurrency = Number.parseInt(
  process.env.TEST_CONCURRENCY ?? "",
  10,
);
const testConcurrency =
  Number.isInteger(requestedConcurrency) && requestedConcurrency > 0
    ? requestedConcurrency
    : Math.min(availableParallelism(), 2);

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
  console.info(
    `Running ${tests.length} test files across ${Math.min(testConcurrency, tests.length)} workers.`,
  );
  const childEnvironment = { ...process.env };
  if (process.stdout.isTTY) {
    childEnvironment.FORCE_COLOR = childEnvironment.FORCE_COLOR ?? "1";
    delete childEnvironment.NO_COLOR;
  }
  const run = (files, concurrency) =>
    new Promise((resolve, reject) => {
      const testArguments = [
        "--test",
        `--test-concurrency=${concurrency}`,
        ...(coverageEnabled
          ? [
              "--experimental-test-coverage",
              "--test-coverage-lines=80",
              "--test-coverage-branches=80",
              "--test-coverage-functions=80",
              "--test-coverage-exclude=src/pixel-editor/**",
              "--test-coverage-exclude=src/pixel-editor-entry.js",
            ]
          : []),
        ...files,
      ];
      const child = spawn(
        process.execPath,
        testArguments,
        {
          env: childEnvironment,
          stdio: ["inherit", "pipe", "pipe"],
        },
      );
      let output = "";
      child.stdout.on("data", (chunk) => {
        output += chunk;
        process.stdout.write(chunk);
      });
      child.stderr.on("data", (chunk) => process.stderr.write(chunk));
      child.on("error", reject);
      child.on("close", (status) => resolve({ output, status }));
    });
  // The structure audit reads the whole repository. Give it an isolated worker
  // so concurrent test startup cannot make an otherwise fast audit exceed its
  // per-test budget.
  const structureTests = tests.filter((file) =>
    file.endsWith("project-structure.test.mjs"),
  );
  const remainingTests = tests.filter((file) => !structureTests.includes(file));
  const results = [];
  if (structureTests.length) results.push(await run(structureTests, 1));
  if (remainingTests.length)
    results.push(
      await run(
        remainingTests,
        Math.min(testConcurrency, remainingTests.length),
      ),
    );
  const result = {
    output: results.map((entry) => entry.output).join(""),
    status: results.find((entry) => entry.status !== 0)?.status ?? 0,
  };
  const plainOutput = result.output.replace(
    // eslint-disable-next-line no-control-regex
    /\u001B\[[0-?]*[ -/]*[@-~]/g,
    "",
  );
  const durations = [...plainOutput.matchAll(/^✔ (.+) \(([\d.]+)ms\)$/gm)].map(
    (match) => ({ test: match[1], duration: Number(match[2]) }),
  );
  const failures = durations
    .filter(({ duration }) => duration > effectiveMaximumDurationMs)
    .map(
      ({ test, duration }) =>
        `${test} took ${duration.toFixed(1)} ms; limit is ${effectiveMaximumDurationMs} ms`,
    );
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  } else if (durations.length !== tests.length) {
    console.error(
      `Expected timing data for ${tests.length} tests; received ${durations.length}`,
    );
    process.exitCode = 1;
  }
  if (failures.length > 0) {
    console.error(`Node test limits failed:\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}
