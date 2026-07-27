import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEmojiDataSync } from "../../../scripts/emoji-data.mjs";

import {
  countByModifierType,
  countBySequenceType,
  createModifierTypeResolver,
} from "./helpers.mjs";

export async function loadAtlasValidationData() {
  const workspace = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const root = path.resolve(workspace, "..");
  const atlasDirectory = path.join(workspace, "atlases");
  const config = await readJson(path.join(workspace, "config.json"));
  const manifest = await readJson(path.join(atlasDirectory, "manifest.json"));
  const emoji = readEmojiDataSync();
  const versionManifest = await readJson(
    path.join(root, "src", "data", "versions", "manifest.json"),
  );
  const proposedEmoji = await loadProposedEmoji(root, versionManifest);
  const eligible = [...emoji, ...proposedEmoji];
  const getModifierType = createModifierTypeResolver(config);

  return {
    atlasDirectory,
    config,
    emoji,
    eligible,
    expectedByKey: new Map(eligible.map((item) => [item.key, item])),
    expectedKeys: new Set(eligible.map((item) => item.key)),
    expectedModifierTypeCounts: countByModifierType(eligible, getModifierType),
    expectedSequenceTypeCounts: countBySequenceType(eligible),
    getModifierType,
    manifest,
    proposedEmoji,
    root,
  };
}

async function loadProposedEmoji(root, versionManifest) {
  return (
    await Promise.all(
      (versionManifest.proposed ?? []).map(async (version) => {
        const proposal = await readJson(
          path.join(root, "src", "data", version.file),
        );
        return (proposal.emoji ?? []).map((item) => ({
          ...item,
          releaseStatus: "proposed",
          unicodeVersion: version.version,
        }));
      }),
    )
  ).flat();
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}
