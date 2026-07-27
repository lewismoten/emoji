import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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
  "README.md": 161,
  "src/explorer/dialog-render.ts": 306,
  "src/explorer/filter-controls.ts": 313,
  "src/explorer/filter-picker.ts": 303,
  "src/explorer/utility-controls.ts": 324,
  "src/explorer-audio.ts": 392,
  "src/pixel-editor/controllers/pixel-editor-transfer.js": 342,
  "src/pixel-editor/pixel-editor-controllers.js": 474,
  "src/pixel-editor/pixel-editor-layer-helpers.js": 352,
  "src/pixel-editor-entry.js": 48,
  "src/site/index.css": 4759,
};
const legacyFileCountBudgets: Record<string, number> = {
  ".": 11,
  src: 14,
  "src/app": 29,
  "src/explorer": 43,
  "src/pixel-editor": 12,
};
const legacyDirectoryCountBudgets: Record<string, number> = {
  ".": 1,
};
const generatedStructurePrefixes = ["dist/", "explorer/", "library/"];
generatedStructurePrefixes.push("pixel-font/build-retro-text/");
const generatedStructureFiles = new Set([
  "emoji.ts",
  "favicon.svg",
  "index.css",
  "index.html",
  "index.js",
  "offline.html",
  "pixel-editor.js",
  "pixel-font/ATLASES.md",
  "robots.txt",
  "screenshot.png",
  "social-preview.png",
  "social-preview.svg",
  "sitemap.xml",
]);
const generatedFilenamePrefixes = [
  ...generatedStructurePrefixes,
  "icons/",
  "locales/",
  "orders/",
  "pixel-font/atlases/",
  "proposed/",
  "versions/",
];
const ignoredRoots = new Set([
  ".git",
  "build",
  "cache",
  "coverage",
  "dist",
  "node_modules",
  ".venv",
]);

const isAuditedSourceFile = (file: string) =>
  !file.includes("/") || file.startsWith("src/");

const gitFiles = () => {
  const files: string[] = [];
  const visit = (directory: string) => {
    for (const entry of readdirSync(path.join(root, directory), {
      withFileTypes: true,
    })) {
      if (entry.name === ".DS_Store") continue;
      const relative =
        directory === "." ? entry.name : `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        if (ignoredRoots.has(relative) || ignoredRoots.has(entry.name))
          continue;
        visit(relative);
        continue;
      }
      files.push(relative);
    }
  };
  visit(".");
  return files.filter(
    (file) =>
      !generatedStructurePrefixes.some((prefix) => file.startsWith(prefix)) &&
      !generatedFilenamePrefixes.some((prefix) => file.startsWith(prefix)),
  );
};

const maintainedFiles = gitFiles();
const auditedFiles = maintainedFiles.filter(isAuditedSourceFile);
const projectFiles = auditedFiles.filter(
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

const countLines = (text: string) => {
  let lines = 1;
  for (let index = 0; index < text.length; index += 1) {
    if (text.charCodeAt(index) === 10) lines += 1;
  }
  return lines;
};

for (const file of measuredFiles) {
  const lines = countLines(readFileSync(path.join(root, file), "utf8"));
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

const uniqueFilenameFiles = auditedFiles.filter(
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
