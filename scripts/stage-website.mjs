import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const outputDirectory = path.resolve(
  root,
  option("--output", path.join("build", "website-staging")),
);
const host = option("--host", "127.0.0.1");
const port = Number.parseInt(option("--port", "4173"), 10);
const skipBuild = hasFlag("--skip-build");
const prepareOnly = hasFlag("--prepare-only");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("--port must be an integer between 1 and 65535");
}

run(process.execPath, [
  path.join(root, "scripts", "publish-website.mjs"),
  ...(skipBuild ? ["--skip-build"] : []),
  "--output",
  outputDirectory,
]);

if (prepareOnly) {
  console.info(`Prepared staging site at ${outputDirectory}`);
  process.exit(0);
}

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".ttf", "font/ttf"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const targetPath = path.resolve(outputDirectory, `.${requested}`);
  if (!targetPath.startsWith(outputDirectory)) {
    respond(response, 403, "text/plain; charset=utf-8", "Forbidden");
    return;
  }
  let filePath = targetPath;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    respond(response, 404, "text/plain; charset=utf-8", "Not Found");
    return;
  }
  const extension = path.extname(filePath).toLowerCase();
  const contentType =
    mimeTypes.get(extension) ?? "application/octet-stream";
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentType,
  });
  fs.createReadStream(filePath).pipe(response);
});

let serverStarted = false;
let shuttingDown = false;
server.on("error", (error) => {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "EPERM" || error.code === "EACCES")
  ) {
    console.warn(
      `Staging site was prepared at ${outputDirectory}, but the local preview server could not listen on ${host}:${port}.`,
    );
    console.warn(
      "Open that folder with any static file server, or rerun with --prepare-only.",
    );
    process.exit(0);
  }
  throw error;
});

server.listen(port, host, () => {
  serverStarted = true;
  const localUrl = `http://${host}:${port}/`;
  console.info(`Staging site ready at ${outputDirectory}`);
  console.info(`Open ${localUrl}`);
  console.info(`Also useful:`);
  console.info(`  ${localUrl}index.ar.html`);
  console.info(`  ${localUrl}index.en-x-newspeak.html`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (shuttingDown) {
      console.log("\n...already shutting down\n");
      process.exit(0);
    }
    if (!serverStarted) {
      process.exit(0);
      console.log("\nServer didn't start yet\n");
    }
    shuttingDown = true;
    console.log("\nShutting Down\n");
    server.close(() => process.exit(0));
  });
}

function hasFlag(flag) {
  return args.includes(flag);
}

function option(flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function respond(response, statusCode, contentType, body) {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}
