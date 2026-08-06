import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { readEmojiJson } from "../../shared/emoji-data.mjs";

describe("release-data", () => {
  it("keeps package manifest and release data consistent", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    type Emoji = {
      key: string;
      codePoints: string;
      group: string;
    };
    type Version = { version: string; file: string; count: number };
    type ProposedVersion = Version & { status: "draft"; released: null };

    const root = path.resolve(process.cwd());
    const readJson = async <T,>(file: string) =>
      JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;
    const emoji = (await readEmojiJson(root)) as Emoji[];
    const emojiByKey = Object.fromEntries(
      emoji.map((item) => [item.key, item]),
    );
    const packageManifest = await readJson<{
      name: string;
      packs: { id: string; count: number }[];
      categories: {
        id: string;
        label: string;
        count: number;
        importPath: string;
        subcategories: {
          id: string;
          label: string;
          count: number;
          importPath: string;
        }[];
      }[];
    }>("dist/manifest.json");
    const manifest = await readJson<{
      versions: Version[];
      proposed?: ProposedVersion[];
    }>("src/data/versions/manifest.json");

    assert.equal(packageManifest.name, "@lewismoten/emoji");
    assert.equal(
      packageManifest.packs.find((pack) => pack.id === "all")?.count,
      emoji.length,
    );
    assert.equal(
      packageManifest.categories.length,
      new Set(emoji.map((item) => item.group)).size,
    );
    for (const category of packageManifest.categories) {
      assert.equal(
        category.importPath,
        `@lewismoten/emoji/categories/${category.id}`,
      );
      assert.equal(
        category.count,
        emoji.filter((item) => item.group === category.label).length,
      );
      assert.equal(
        category.subcategories.reduce(
          (count, subcategory) => count + subcategory.count,
          0,
        ),
        category.count,
      );
      for (const subcategory of category.subcategories) {
        assert.equal(
          subcategory.importPath,
          `@lewismoten/emoji/categories/${category.id}/${subcategory.id}`,
        );
      }
    }

    const versionKeys = new Set<string>();
    for (const version of manifest.versions) {
      const keys = await readJson<string[]>(
        `src/data/versions/${version.file}`,
      );
      assert.equal(keys.length, version.count);
      assert.equal(new Set(keys).size, keys.length);
      for (const key of keys) {
        assert.ok(
          key in emojiByKey,
          `${version.version} contains unknown ${key}`,
        );
        assert.ok(
          !versionKeys.has(key),
          `${key} has multiple introduction files`,
        );
        versionKeys.add(key);
      }
    }
    assert.deepEqual(versionKeys, new Set(Object.keys(emojiByKey)));

    const releasedCodePoints = new Set(emoji.map((item) => item.codePoints));
    for (const version of manifest.proposed ?? []) {
      assert.equal(version.status, "draft");
      assert.equal(version.released, null);
      const proposal = await readJson<{ count: number; emoji: Emoji[] }>(
        `src/data/${version.file}`,
      );
      assert.equal(proposal.count, version.count);
      assert.ok(
        proposal.emoji.every(
          (item) => !releasedCodePoints.has(item.codePoints),
        ),
      );
    }
  });
});
