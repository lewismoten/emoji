import fs from "node:fs";
import path from "node:path";

const siteDirectory = path.resolve(process.argv[2] ?? "_site");
const workerFile = path.join(siteDirectory, "service-worker.js");
const worker = fs.readFileSync(workerFile, "utf8");
const match = /const CORE_ASSETS = (\[[\s\S]*?\]);/.exec(worker);

if (!match) {
  throw new Error("The generated service worker has no core asset list");
}

const missing = JSON.parse(match[1])
  .map((asset) => asset.replace(/^\.\//, "").replace(/\?.*$/, ""))
  .map((asset) => asset || "index.html")
  .filter((asset) => !fs.existsSync(path.join(siteDirectory, asset)));

if (missing.length > 0) {
  throw new Error(
    `Pages site is missing ${missing.length} precache asset${missing.length === 1 ? "" : "s"}:\n${missing.join("\n")}`,
  );
}

console.info(
  `Verified ${JSON.parse(match[1]).length} precache assets in ${siteDirectory}.`,
);
