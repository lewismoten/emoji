import activities from "@lewismoten/emoji/categories/activities";
import emoji from "@lewismoten/emoji/all";
import {
  createEmojiSearch,
  mergeEmojiLocalePacks,
} from "@lewismoten/emoji/search";
import { describe, expectTypeOf, it } from "vitest";

describe("package-exports", () => {
  it("preserves typed package exports for categories, all emoji, and search helpers", () => {
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

    expectTypeOf(activity).toEqualTypeOf<string>();
    expectTypeOf(allEmoji).toEqualTypeOf<string>();
    expectTypeOf(matches).toEqualTypeOf<string[]>();
    expectTypeOf(mergedSearch).toBeFunction();

    // Exact emoji names from merger-module declarations must remain available.
    // @ts-expect-error Unknown emoji keys must still be rejected.
    activities.notAnEmoji;
    // @ts-expect-error Unknown emoji keys must still be rejected.
    emoji.notAnEmoji;
  });
});
