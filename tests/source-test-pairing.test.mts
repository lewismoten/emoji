import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const legacyMissingTestPairs = new Set<string>([]);

function walk(directory: string, extension: string) {
  let files: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
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
    ...walk("tests", ".test.mts"),
    ...walk("tests", ".test.ts"),
  ].sort(),
);

function expectedTestFiles(sourceFile: string) {
  const relative = sourceFile.replace(/^src\//, "").replace(/\.ts$/, "");
  const [topLevel] = relative.split("/");
  const basename = path.posix.basename(relative);
  return [
    `tests/${relative}.test.mts`,
    `tests/${relative}.test.ts`,
    `tests/${topLevel}/${basename}.test.mts`,
    `tests/${topLevel}/${basename}.test.ts`,
  ];
}

const missingTests = sourceFiles.filter(
  (sourceFile) =>
    !expectedTestFiles(sourceFile).some((candidate) => testFiles.has(candidate)),
);

function expectedImportSpecifiers(sourceFile: string, testFile: string) {
  const relative = path.posix.relative(
    path.posix.dirname(testFile),
    sourceFile,
  );
  const jsSpecifier = relative.replace(/\.ts$/, ".js");
  return [jsSpecifier.startsWith(".") ? jsSpecifier : `./${jsSpecifier}`];
}

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
  const matchingTests = expectedTestFiles(sourceFile).filter((candidate) =>
    testFiles.has(candidate),
  );
  if (matchingTests.length === 0) continue;
  const importsSource = matchingTests.some((testFile) => {
    const contents = fs.readFileSync(path.join(root, testFile), "utf8");
    return expectedImportSpecifiers(sourceFile, testFile).some((specifier) =>
      contents.includes(specifier),
    );
  });
  if (!importsSource) {
    pairingProblems.push(
      `${sourceFile} has a matching test file, but none of ${matchingTests.join(", ")} reference its source module`,
    );
  }
}

assert.deepEqual(
  pairingProblems,
  [],
  `Every src TypeScript file should have a matching test file under tests/.\n${pairingProblems.join("\n")}`,
);
