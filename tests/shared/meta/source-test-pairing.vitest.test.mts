import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const legacyMissingTestPairs = new Set<string>([
  "src/app/bootstrap/explorer-bootstrap-session.ts",
  "src/app/dialog/dialog-view-runtime.ts",
  "src/app/emoji/emoji-dialog-click-runtime.ts",
  "src/app/emoji/emoji-session-controller.ts",
  "src/app/emoji/emoji-wire-up.ts",
  "src/app/explorer-app-events.ts",
  "src/app/startup/startup-runtime.ts",
  "src/app/version/version-mode-controller.ts",
  "src/explorer/category/category-version.ts",
  "src/explorer/filters/filter-controls.ts",
  "src/explorer/filters/filter-picker.ts",
  "src/explorer/filters/version-data.ts",
  "src/resolve-connected-elements.ts",
  "src/deepEqual.ts",
]);

function walk(directory: string, extension: string) {
  let files: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, directory), {
    withFileTypes: true,
  })) {
    if (entry.name === ".DS_Store") continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(relative, extension));
    } else if (relative.endsWith(extension)) {
      files.push(relative);
    }
  }
  return files;
}

const sourceFiles = walk("src", ".ts")
  .filter((file) => !file.endsWith(".d.ts"))
  .sort();
const testFiles = new Set(
  [
    ...walk("tests", ".vitest.test.mts"),
    ...walk("tests", ".test.mts"),
    ...walk("tests", ".test.ts"),
  ].sort(),
);

function expectedTestFiles(sourceFile: string) {
  const relative = sourceFile.replace(/^src\//, "").replace(/\.ts$/, "");
  return [
    `tests/${relative}.vitest.test.mts`,
    `tests/${relative}.test.mts`,
    `tests/${relative}.test.ts`,
  ];
}

function matchingTestFiles(sourceFile: string) {
  const base = path.posix.basename(sourceFile).replace(/\.ts$/, "");
  return [...testFiles].filter((candidate) => {
    const name = path.posix.basename(candidate);
    return (
      name === `${base}.vitest.test.mts` ||
      name === `${base}.test.mts` ||
      name === `${base}.test.ts`
    );
  });
}

function expectedImportSpecifiers(sourceFile: string, testFile: string) {
  const relative = path.posix.relative(
    path.posix.dirname(testFile),
    sourceFile,
  );
  const jsSpecifier = relative.replace(/\.ts$/, ".js");
  return [jsSpecifier.startsWith(".") ? jsSpecifier : `./${jsSpecifier}`];
}

describe("source-test-pairing", () => {
  it("treats vitest files as valid source pairings", () => {
    const missingTests = sourceFiles.filter(
      (sourceFile) => matchingTestFiles(sourceFile).length === 0,
    );

    const pairingProblems: string[] = [];

    for (const sourceFile of missingTests) {
      if (!legacyMissingTestPairs.has(sourceFile)) {
        pairingProblems.push(
          `${sourceFile} is missing a matching test file under tests/ (expected one of: ${expectedTestFiles(sourceFile).join(", ")})`,
        );
      }
    }

    for (const sourceFile of legacyMissingTestPairs) {
      if (!missingTests.includes(sourceFile)) {
        pairingProblems.push(
          `${sourceFile} now has a matching test file; remove it from legacyMissingTestPairs`,
        );
      }
    }

    for (const sourceFile of sourceFiles) {
      const matchingTests = matchingTestFiles(sourceFile);
      if (matchingTests.length === 0) continue;
      const importsSource = matchingTests.some((testFile) => {
        const contents = fs.readFileSync(path.join(root, testFile), "utf8");
        return expectedImportSpecifiers(sourceFile, testFile).some(
          (specifier) => contents.includes(specifier),
        );
      });
      if (!importsSource) {
        pairingProblems.push(
          `${sourceFile} has a matching test file, but none of ${matchingTests.join(", ")} reference its source module`,
        );
      }
    }

    expect(
      pairingProblems,
      `Every src TypeScript file should have a matching test file under tests/.\n${pairingProblems.join("\n")}`,
    ).toEqual([]);
  });
});
