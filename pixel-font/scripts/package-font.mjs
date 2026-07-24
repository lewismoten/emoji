import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const root = path.resolve(workspace, "..");
const buildDirectory = path.join(workspace, "build");
const packageDirectory = path.join(buildDirectory, "package");
const releaseDirectory = path.join(buildDirectory, "release");
const config = JSON.parse(
  await fs.readFile(path.join(workspace, "config.json"), "utf8"),
);
const template = JSON.parse(
  await fs.readFile(path.join(workspace, "package.template.json"), "utf8"),
);
const buildManifest = JSON.parse(
  await fs.readFile(path.join(buildDirectory, "manifest.json"), "utf8"),
);

if (buildManifest.fontVersion !== config.fontVersion) {
  throw new Error(
    `Built font version ${buildManifest.fontVersion} does not match config ${config.fontVersion}`,
  );
}
if (buildManifest.embeddingPermissions !== "installable") {
  throw new Error("Only an installable-embedding font may be packaged");
}

await Promise.all([
  fs.rm(packageDirectory, { recursive: true, force: true }),
  fs.rm(releaseDirectory, { recursive: true, force: true }),
]);
await Promise.all([
  fs.mkdir(packageDirectory, { recursive: true }),
  fs.mkdir(releaseDirectory, { recursive: true }),
]);

const packageJson = {
  name: config.packageName,
  version: config.fontVersion,
  ...template,
};
await writeJson(path.join(packageDirectory, "package.json"), packageJson);
await fs.cp(
  path.join(buildDirectory, "font"),
  path.join(packageDirectory, "font"),
  { recursive: true },
);
await fs.writeFile(
  path.join(packageDirectory, "font", "pixel-emoji.css"),
  renderPackageStylesheet(Boolean(buildManifest.fontSets.proposed.files)),
);
await Promise.all([
  fs.copyFile(
    path.join(buildDirectory, "manifest.json"),
    path.join(packageDirectory, "manifest.json"),
  ),
  fs.copyFile(
    path.join(workspace, "PACKAGE_README.md"),
    path.join(packageDirectory, "README.md"),
  ),
  fs.copyFile(
    path.join(root, "LICENSE.md"),
    path.join(packageDirectory, "LICENSE.md"),
  ),
  fs.copyFile(
    path.join(root, "NOTICE.md"),
    path.join(packageDirectory, "NOTICE.md"),
  ),
]);

const releaseFiles = [
  ["font/pixel-emoji.ttf", `pixel-emoji-${config.fontVersion}.ttf`],
  ["font/pixel-emoji.woff", `pixel-emoji-${config.fontVersion}.woff`],
  ["font/pixel-emoji.woff2", `pixel-emoji-${config.fontVersion}.woff2`],
  ["font/pixel-emoji.css", `pixel-emoji-${config.fontVersion}.css`],
  ["manifest.json", `pixel-emoji-${config.fontVersion}-manifest.json`],
];
if (buildManifest.fontSets.proposed.files) {
  releaseFiles.push(
    [
      "font/proposed/pixel-emoji.ttf",
      `pixel-emoji-proposed-${config.fontVersion}.ttf`,
    ],
    [
      "font/proposed/pixel-emoji.woff",
      `pixel-emoji-proposed-${config.fontVersion}.woff`,
    ],
    [
      "font/proposed/pixel-emoji.woff2",
      `pixel-emoji-proposed-${config.fontVersion}.woff2`,
    ],
  );
}
await Promise.all(
  releaseFiles.map(([source, destination]) =>
    fs.copyFile(
      path.join(packageDirectory, source),
      path.join(releaseDirectory, destination),
    ),
  ),
);
await writeJson(path.join(releaseDirectory, "release.json"), {
  packageName: config.packageName,
  fontVersion: config.fontVersion,
  tag: `pixel-emoji-v${config.fontVersion}`,
  files: releaseFiles.map(([, destination]) => destination),
});

console.info(
  `Packaged ${config.packageName}@${config.fontVersion} with ${releaseFiles.length} release files.`,
);

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function renderPackageStylesheet(hasProposedFont) {
  const proposedProperty = hasProposedFont
    ? '  --pixel-emoji-proposed-family: "Pixel Emoji Proposed";\n'
    : "";
  const proposedRule = hasProposedFont
    ? `@font-face {
  font-family: "Pixel Emoji Proposed";
  src:
    url("./proposed/pixel-emoji.woff2") format("woff2"),
    url("./proposed/pixel-emoji.woff") format("woff");
  font-display: swap;
}

`
    : "";
  return `:root {
  --pixel-emoji-released-family: "Pixel Emoji";
${proposedProperty}}

${proposedRule}@font-face {
  font-family: "Pixel Emoji";
  src:
    url("./pixel-emoji.woff2") format("woff2"),
    url("./pixel-emoji.woff") format("woff");
  font-display: swap;
}
`;
}
