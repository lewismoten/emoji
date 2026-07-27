import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSiteIcons } from "./generate-site-icons.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "src", "site");

const files = [
  "index.html",
  "index.css",
  "manifest.webmanifest",
  "offline.html",
  "favicon.svg",
  "screenshot.png",
  "robots.txt",
  "sitemap.xml",
];

const copyFile = (file) => {
  const source = path.join(sourceDirectory, file);
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
};

for (const file of files) copyFile(file);
const iconResult = generateSiteIcons({
  favicon: path.join(sourceDirectory, "favicon.svg"),
  outputDirectory: path.join(root, "icons"),
});

console.info(
  `Synced ${files.length} site files and ${iconResult.files.length} generated icons from src/site to the project root.`,
);
