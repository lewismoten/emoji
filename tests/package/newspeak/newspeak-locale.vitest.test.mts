import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("newspeak-locale", () => {
  it("keeps banned oldspeak terms out of generated locale files", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const root = path.resolve(process.cwd());

    const bannedTerms = [
      "excellen",
      "wonderful",
      "great",
      "fantastic",
      "superb",
      "amazing",
      "plus",
      "doubleplusgood",
      "plusgood",
      "double-plus",
      "bad",
      "aweful",
      "terrible",
      "horrible",
      "poor",
      "very",
      "extremely",
      "slightly",
      "fairly",
      "remarkably",
      "incredibly",
      "barely",
      "mostly",
      "better",
      "best",
      "worse",
      "worst",
      "thought",
      "decision",
      "carefully",
      "quickly",
      "successful",
      "invalid",
      "freedom",
      "liberty",
      "privacy",
      "justice",
      "equlity",
      "individuality",
      "dissent",
      "rebellion",
      "skepticism",
      "rights",
      "truth",
      "faslehood",
      "opinion",
      "conscience",
      "free",
      "please",
      "perhaps",
      "maybe",
      "possibly",
      "kindly",
      "would you",
      "could you",
      "it appears",
      "we believe",
      "you may wish to",
      "usually",
    ];

    const localeFiles = [
      "src/data/locales/en-x-newspeak.json",
      "src/demo-locales/ui.en-x-newspeak.json",
    ];

    function collectStringValues(value: unknown): string[] {
      if (typeof value === "string") return [value];
      if (Array.isArray(value))
        return value.flatMap((entry) => collectStringValues(entry));
      if (value && typeof value === "object") {
        return Object.values(value).flatMap((entry) =>
          collectStringValues(entry),
        );
      }
      return [];
    }

    function hasBannedTerm(text: string, term: string) {
      if (term.includes(" ")) return text.includes(term);
      return new RegExp(
        `(?<![a-z])${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(?![a-z])`,
      ).test(text);
    }

    for (const relativePath of localeFiles) {
      const raw = await fs.readFile(path.join(root, relativePath), "utf8");
      const json = JSON.parse(raw) as unknown;
      const values = collectStringValues(json).map((value) =>
        value.toLowerCase(),
      );
      const offenders = new Set<string>();

      for (const term of bannedTerms) {
        if (values.some((value) => hasBannedTerm(value, term))) {
          offenders.add(term);
        }
      }

      assert.deepEqual(
        [...offenders],
        [],
        `${relativePath} contains banned oldspeak terms: ${[...offenders].join(", ")}`,
      );
    }
  });
});
