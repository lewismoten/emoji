import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const structureLimits = {
  linesPerScriptOrStylesheet: 300,
  filesPerDirectory: 10,
  directoriesPerDirectory: 10,
};

// These are ratcheting budgets for existing structural debt. New files and
// directories receive no exception. Lower a budget whenever a split reduces it.
const legacyLineBudgets: Record<string, number> = {
  "README.md": 410,
  "index.css": 3113,
  "pixel-editor.js": 2455,
  "pixel-font/PIXEL_EMOJI.md": 504,
  "pixel-font/scripts/build-assets.mjs": 940,
  "pixel-font/scripts/generate-atlases.mjs": 382,
  "pixel-font/scripts/validate-atlases.mjs": 356,
  "tests/unit.test.mts": 2124,
  "src/index.ts": 4374,
};
const legacyFileCountBudgets: Record<string, number> = {
  ".": 24,
  "pixel-font/atlases/animals-and-nature": 11,
  "pixel-font/atlases/modifiers/skin-tone/people-and-body": 29,
  "pixel-font/atlases/objects": 23,
  "pixel-font/atlases/people-and-body": 21,
  "pixel-font/atlases/smileys-and-emotion": 20,
  "pixel-font/atlases/symbols": 16,
  "pixel-font/atlases/travel-and-places": 12,
  scripts: 13,
  versions: 18,
};
const legacyDirectoryCountBudgets: Record<string, number> = {
  ".": 12,
  "pixel-font/atlases": 11,
};
const generatedStructurePrefixes = ["dist/", "explorer/", "library/"];
const generatedStructureFiles = new Set([
  "emoji.json",
  "emoji.ts",
  "index.js",
  "pixel-font/ATLASES.md",
]);
const generatedFilenamePrefixes = [
  ...generatedStructurePrefixes,
  "locales/",
  "orders/",
  "pixel-font/atlases/",
  "proposed/",
  "versions/",
];
const gitFiles = () =>
  execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root },
  )
    .toString()
    .split("\0")
    .filter(Boolean)
    .filter((file) => existsSync(path.join(root, file)));

const maintainedFiles = gitFiles();
const projectFiles = maintainedFiles.filter(
  (file) =>
    !generatedStructureFiles.has(file) &&
    !generatedStructurePrefixes.some((prefix) => file.startsWith(prefix)),
);
const structureDirectories = new Map<
  string,
  { files: Set<string>; directories: Set<string> }
>();
const structureDirectory = (directory: string) => {
  const existing = structureDirectories.get(directory);
  if (existing) return existing;
  const created = { files: new Set<string>(), directories: new Set<string>() };
  structureDirectories.set(directory, created);
  return created;
};

for (const file of projectFiles) {
  let directory = path.posix.dirname(file);
  structureDirectory(directory).files.add(path.posix.basename(file));
  while (directory !== ".") {
    const parent = path.posix.dirname(directory);
    structureDirectory(parent).directories.add(path.posix.basename(directory));
    directory = parent;
  }
}

const structureProblems: string[] = [];
const measuredFiles = projectFiles.filter((file) =>
  /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts|css|md|mdx)$/i.test(file),
);
const lineCounts = await Promise.all(
  measuredFiles.map(async (file) => ({
    file,
    lines: (await fs.readFile(path.join(root, file), "utf8")).split(/\r?\n/)
      .length,
  })),
);
for (const { file, lines } of lineCounts) {
  const budget =
    legacyLineBudgets[file] ?? structureLimits.linesPerScriptOrStylesheet;
  if (lines > budget) {
    structureProblems.push(
      `${file} has ${lines} lines; its limit is ${budget}`,
    );
  } else if (legacyLineBudgets[file] !== undefined && lines < budget) {
    structureProblems.push(
      `${file} improved to ${lines} lines; lower its legacy budget from ${budget}`,
    );
  }
}

for (const [directory, contents] of structureDirectories) {
  const fileCount = contents.files.size;
  const fileBudget =
    legacyFileCountBudgets[directory] ?? structureLimits.filesPerDirectory;
  if (fileCount > fileBudget) {
    structureProblems.push(
      `${directory} contains ${fileCount} files; its limit is ${fileBudget}`,
    );
  } else if (
    legacyFileCountBudgets[directory] !== undefined &&
    fileCount < fileBudget
  ) {
    structureProblems.push(
      `${directory} now contains ${fileCount} files; lower its legacy budget from ${fileBudget}`,
    );
  }

  const directoryCount = contents.directories.size;
  const directoryBudget =
    legacyDirectoryCountBudgets[directory] ??
    structureLimits.directoriesPerDirectory;
  if (directoryCount > directoryBudget) {
    structureProblems.push(
      `${directory} contains ${directoryCount} folders; its limit is ${directoryBudget}`,
    );
  } else if (
    legacyDirectoryCountBudgets[directory] !== undefined &&
    directoryCount < directoryBudget
  ) {
    structureProblems.push(
      `${directory} now contains ${directoryCount} folders; lower its legacy budget from ${directoryBudget}`,
    );
  }
}

const uniqueFilenameFiles = maintainedFiles.filter(
  (file) =>
    !generatedStructureFiles.has(file) &&
    !generatedFilenamePrefixes.some((prefix) => file.startsWith(prefix)),
);
const filesByName = new Map<string, string[]>();
for (const file of uniqueFilenameFiles) {
  const filename = path.posix.basename(file);
  if (!path.posix.extname(filename)) continue;
  const normalizedFilename = filename.toLocaleLowerCase("en");
  const matches = filesByName.get(normalizedFilename) ?? [];
  matches.push(file);
  filesByName.set(normalizedFilename, matches);
}
for (const [filename, matches] of filesByName) {
  if (matches.length > 1) {
    structureProblems.push(`${filename} is not unique: ${matches.join(", ")}`);
  }
}

assert.deepEqual(
  structureProblems,
  [],
  `Project structure limits failed:\n${structureProblems.join("\n")}`,
);
