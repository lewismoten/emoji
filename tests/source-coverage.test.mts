import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const walk = (directory: string, extensions: string[]) => {
  let files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(absolute, extensions));
      continue;
    }
    if (extensions.some((extension) => absolute.endsWith(extension))) {
      files.push(absolute);
    }
  }
  return files;
};

const srcFiles = walk(path.join(root, "src"), [".ts"])
  .filter((file) => !file.endsWith(".d.ts"))
  .map((file) => path.relative(root, file).replaceAll(path.sep, "/"))
  .sort();
const testFiles = walk(path.join(root, "tests"), [".mts", ".mjs", ".ts", ".js"]);
const testCorpus = testFiles
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const importExpression =
  /from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const sourceGraph = new Map<string, string[]>();

for (const sourceFile of srcFiles) {
  const source = fs.readFileSync(path.join(root, sourceFile), "utf8");
  const dependencies: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importExpression.exec(source))) {
    const specifier = match[1] ?? match[2];
    if (!specifier?.startsWith(".")) continue;
    const baseDirectory = path.posix.dirname(sourceFile);
    let resolved = path.posix.normalize(
      path.posix.join(baseDirectory, specifier),
    );
    if (resolved.endsWith(".js")) resolved = `${resolved.slice(0, -3)}.ts`;
    else if (!path.posix.extname(resolved)) resolved = `${resolved}.ts`;
    if (srcFiles.includes(resolved)) dependencies.push(resolved);
  }
  sourceGraph.set(sourceFile, dependencies);
}

const seedFiles = new Set<string>();
for (const sourceFile of srcFiles) {
  const jsFile = sourceFile.replace(/\.ts$/, ".js");
  const withoutRoot = sourceFile.replace(/^src\//, "");
  const withoutExtension = withoutRoot.replace(/\.ts$/, "");
  if (
    testCorpus.includes(sourceFile) ||
    testCorpus.includes(jsFile) ||
    testCorpus.includes(withoutRoot) ||
    testCorpus.includes(withoutExtension)
  ) {
    seedFiles.add(sourceFile);
  }
}

const visited = new Set<string>();
const stack = [...seedFiles];
while (stack.length > 0) {
  const current = stack.pop();
  if (!current || visited.has(current)) continue;
  visited.add(current);
  for (const dependency of sourceGraph.get(current) ?? []) {
    if (!visited.has(dependency)) stack.push(dependency);
  }
}

const uncovered = srcFiles.filter((sourceFile) => !visited.has(sourceFile));

assert.deepEqual(
  uncovered,
  [],
  `Every TypeScript file under src must be covered by at least one test root or transitive dependency.\nUncovered files:\n${uncovered.join("\n")}`,
);
