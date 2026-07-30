import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEmojiDataSync } from "../../../scripts/emoji-data.mjs";

export async function loadAtlasGenerationContext() {
  const workspace = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const root = path.resolve(workspace, "..");
  const atlasDirectory = path.join(workspace, "atlases");
  const config = JSON.parse(
    await fs.readFile(path.join(workspace, "config.json"), "utf8"),
  );
  const emoji = readEmojiDataSync();
  const versionManifest = JSON.parse(
    await fs.readFile(
      path.join(root, "src", "data", "versions", "manifest.json"),
      "utf8",
    ),
  );
  const proposedEmoji = (
    await Promise.all(
      (versionManifest.proposed ?? []).map(async (version) => {
        const proposal = JSON.parse(
          await fs.readFile(
            path.join(root, "src", "data", version.file),
            "utf8",
          ),
        );
        return (proposal.emoji ?? []).map((item) => ({
          ...item,
          releaseStatus: "proposed",
          unicodeVersion: version.version,
          proposalStage: version.stage ?? version.status ?? proposal.status,
          expectedRelease: version.expectedRelease ?? null,
        }));
      }),
    )
  ).flat();
  const sheetCapacity = config.columns * config.maxRows;
  const slotSize = config.cellSize + config.cellPadding * 2;
  const imageWidth = config.outerPadding * 2 + config.columns * slotSize;

  return {
    atlasDirectory,
    config,
    emoji,
    imageWidth,
    proposedEmoji,
    root,
    sheetCapacity,
    slotSize,
    versionManifest,
    workspace,
  };
}
