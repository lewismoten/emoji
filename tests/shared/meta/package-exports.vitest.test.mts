import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "vitest";

type ActivitiesExport =
  (typeof import("@lewismoten/emoji/categories/activities"))["default"];
type AllEmojiExport = (typeof import("@lewismoten/emoji/all"))["default"];
type SearchModule = typeof import("@lewismoten/emoji/search");

describe("package-exports", () => {
  it("preserves typed package exports for categories, all emoji, and search helpers", async () => {
    const root = process.cwd();
    const [{ default: activities }, { default: emoji }, searchModule] =
      await Promise.all([
        import(
          pathToFileURL(
            path.join(root, "dist/esm/categories/activities.min.js"),
          ).href
        ),
        import(pathToFileURL(path.join(root, "dist/esm/all.min.js")).href),
        import(pathToFileURL(path.join(root, "dist/esm/search.min.js")).href),
      ]);
    const { createEmojiSearch, mergeEmojiLocalePacks } = searchModule;

    const activity: string = activities.artistPalette;
    const allEmoji: string = emoji.clinkingBeerMugs;
    const search = createEmojiSearch({
      annotations: { artistPalette: ["artist palette", "painting"] },
    });
    const matches: string[] = search("painting");
    const mergedSearch = createEmojiSearch(
      mergeEmojiLocalePacks(
        {
          locale: "en",
          annotations: { artistPalette: ["artist palette"] },
          labels: { objects: "Objects" },
        },
        { locale: "en-US", baseLocale: "en", annotations: {}, labels: {} },
      ),
    );

    const typedActivities: ActivitiesExport = activities;
    const typedEmoji: AllEmojiExport = emoji;
    const typedCreateEmojiSearch: SearchModule["createEmojiSearch"] =
      createEmojiSearch;
    const typedMergeEmojiLocalePacks: SearchModule["mergeEmojiLocalePacks"] =
      mergeEmojiLocalePacks;
    const typedMatches: string[] = matches;
    const typedMergedSearch: (query: string) => string[] = mergedSearch;
    void typedActivities;
    void typedEmoji;
    void typedCreateEmojiSearch;
    void typedMergeEmojiLocalePacks;
    void typedMatches;
    void typedMergedSearch;
    void activity;
    void allEmoji;

    // Exact emoji names from merger-module declarations must remain available.
    // @ts-expect-error Unknown emoji keys must still be rejected.
    typedActivities.notAnEmoji;
    // @ts-expect-error Unknown emoji keys must still be rejected.
    typedEmoji.notAnEmoji;
  });
});
