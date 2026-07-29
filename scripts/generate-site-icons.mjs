import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const generatedIcons = [
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "icon.svg",
  "icon-maskable.svg",
];

const generateWithSips = (favicon, maskableFavicon, iconDirectory) => {
  const rasterTargets = [
    ["icon-192.png", "192", favicon],
    ["icon-512.png", "512", favicon],
    ["icon-maskable-512.png", "512", maskableFavicon],
  ];
  for (const [filename, size, sourceSvg] of rasterTargets) {
    const result = spawnSync(
      "sips",
      [
        "-s",
        "format",
        "png",
        "-z",
        size,
        size,
        sourceSvg,
        "--out",
        path.join(iconDirectory, filename),
      ],
      { stdio: "pipe" },
    );
    if (result.status !== 0) {
      throw new Error(
        `sips failed while generating ${filename}: ${result.stderr.toString("utf8")}`,
      );
    }
  }
  fs.copyFileSync(favicon, path.join(iconDirectory, "icon.svg"));
  fs.copyFileSync(maskableFavicon, path.join(iconDirectory, "icon-maskable.svg"));
};

const generateWithFfmpegPlaceholders = (
  favicon,
  maskableFavicon,
  iconDirectory,
) => {
  const rasterTargets = [
    ["icon-192.png", "192"],
    ["icon-512.png", "512"],
    ["icon-maskable-512.png", "512"],
  ];
  for (const [filename, size] of rasterTargets) {
    const result = spawnSync(
      "ffmpeg",
      [
        "-f",
        "lavfi",
        "-i",
        `color=c=#240c37:s=${size}x${size}`,
        "-frames:v",
        "1",
        "-update",
        "1",
        "-y",
        path.join(iconDirectory, filename),
      ],
      { stdio: "pipe" },
    );
    if (result.status !== 0) {
      throw new Error(
        `ffmpeg failed while generating ${filename}: ${result.stderr.toString("utf8")}`,
      );
    }
  }
  fs.copyFileSync(favicon, path.join(iconDirectory, "icon.svg"));
  fs.copyFileSync(maskableFavicon, path.join(iconDirectory, "icon-maskable.svg"));
};

export const generateSiteIcons = ({
  favicon = path.join(root, "src", "site", "favicon.svg"),
  maskableFavicon = path.join(root, "src", "site", "pwa", "icon-maskable.svg"),
  outputDirectory = path.join(root, "src", "site", "pwa", "icons"),
} = {}) => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  const sipsAvailable =
    spawnSync("sips", ["--help"], { stdio: "ignore" }).status === 0;
  if (sipsAvailable) {
    try {
      generateWithSips(favicon, maskableFavicon, outputDirectory);
      return {
        generated: true,
        outputDirectory,
        files: generatedIcons,
      };
    } catch (error) {
      console.warn(
        `Unable to rasterize ${path.relative(root, favicon)} automatically: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  const ffmpegAvailable =
    spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
  if (ffmpegAvailable) {
    try {
      generateWithFfmpegPlaceholders(
        favicon,
        maskableFavicon,
        outputDirectory,
      );
      console.warn(
        `Used ffmpeg placeholder PNGs for ${path.relative(root, outputDirectory)} because SVG rasterization is unavailable.`,
      );
      return {
        generated: true,
        outputDirectory,
        files: generatedIcons,
      };
    } catch (error) {
      console.warn(
        `Unable to synthesize placeholder PNG icons automatically: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const repositoryIconsDirectory = path.join(root, "src", "site", "pwa", "icons");
  if (
    path.resolve(outputDirectory) !== path.resolve(repositoryIconsDirectory)
  ) {
    for (const file of generatedIcons) {
      const source = path.join(repositoryIconsDirectory, file);
      const target = path.join(outputDirectory, file);
      if (!fs.existsSync(target) && fs.existsSync(source)) {
        fs.copyFileSync(source, target);
      }
    }
  }

  for (const [file, sourceSvg] of [
    ["icon.svg", favicon],
    ["icon-maskable.svg", maskableFavicon],
  ]) {
    const target = path.join(outputDirectory, file);
    if (!fs.existsSync(target) && fs.existsSync(sourceSvg)) {
      fs.copyFileSync(sourceSvg, target);
    }
  }

  const missing = generatedIcons.filter(
    (file) => !fs.existsSync(path.join(outputDirectory, file)),
  );
  if (missing.length > 0) {
    throw new Error(
      `Unable to generate site icons automatically because no supported rasterizer is available and these generated icons are missing: ${missing.join(", ")}`,
    );
  }
  console.warn(
    `No supported icon rasterizer was found; reusing existing generated icons in ${path.relative(root, outputDirectory)}.`,
  );
  return {
    generated: false,
    outputDirectory,
    files: generatedIcons,
  };
};

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const result = generateSiteIcons();
  console.info(
    `${result.generated ? "Generated" : "Reused"} ${result.files.length} site icons in ${path.relative(root, result.outputDirectory)}.`,
  );
}
