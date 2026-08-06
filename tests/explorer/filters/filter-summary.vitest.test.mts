import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { updateActiveFilterSummary } from "../../../src/explorer/filters/filter-summary.js";

class FakeTextNode {
  constructor(readonly textContent: string) {}
}

class FakeEmojiNode {
  constructor(readonly textContent: string) {}

  cloneNode() {
    return new FakeEmojiNode(this.textContent);
  }
}

class FakeFragment {
  childNodes: Array<FakeTextNode | FakeEmojiNode> = [];

  append(...nodes: Array<FakeTextNode | FakeEmojiNode>) {
    this.childNodes.push(...nodes);
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }

  toText() {
    return this.childNodes.map((node) => node.textContent).join("");
  }
}

describe("filter-summary", () => {
  it("renders and hides the active filter summary as filters change", () => {
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

    try {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          createDocumentFragment() {
            return new FakeFragment();
          },
          createTextNode(text: string) {
            return new FakeTextNode(text);
          },
        },
      });

      const activeFilterSummary = { hidden: true };
      const replacements: FakeFragment[] = [];
      const activeFilterText = {
        replaceChildren(fragment: FakeFragment) {
          replacements.push(fragment);
        },
      };

      const emojiLabel = {
        querySelector(selector: string) {
          return selector === ".modifier-emoji" ? new FakeEmojiNode("🏽") : null;
        },
      };

      updateActiveFilterSummary({
        activeFilterSummary: activeFilterSummary as any,
        activeFilterText: activeFilterText as any,
        displayGroupName: (name) => `group:${name}`,
        displayUnicodeSubGroupName: (name) => `subgroup:${name}`,
        genderCheckboxes: [
          {
            checked: true,
            value: "neutral",
            closest: () => null,
          },
        ],
        hairCheckboxes: [],
        latestReleased: "17.0",
        orderMode: "unicode",
        searchText: " arrow ",
        selectedGroup: "Objects",
        selectedSequenceType: "",
        selectedSubGroup: "Objects::mail",
        sequenceTranslationKeys: {},
        sequenceTypeLabels: {},
        skinToneCheckboxes: [
          {
            checked: true,
            value: "1F3FD",
            closest: () => emojiLabel as any,
          },
        ],
        translate: (key, fallback) =>
          (
            {
              throughVersion: "Through",
            } as Record<string, string>
          )[key] ?? fallback,
        versionMode: "through",
        versionSliderLabel: (version) => `Emoji ${version}`,
        versionValue: "16.0",
      });

      assert.equal(activeFilterSummary.hidden, false);
      assert.equal(
        replacements[0]?.toText(),
        "“arrow” · group:Objects · subgroup:mail · Through Emoji 16.0 · 🏽 · neutral",
      );

      replacements.length = 0;
      updateActiveFilterSummary({
        activeFilterSummary: activeFilterSummary as any,
        activeFilterText: activeFilterText as any,
        displayGroupName: (name) => name,
        displayUnicodeSubGroupName: (name) => name,
        genderCheckboxes: [],
        hairCheckboxes: [],
        latestReleased: "17.0",
        orderMode: "sequence",
        searchText: "",
        selectedGroup: "ignored",
        selectedSequenceType: "zwj",
        selectedSubGroup: "ignored::value",
        sequenceTranslationKeys: { zwj: "sequenceJoiner" },
        sequenceTypeLabels: { zwj: "ZWJ sequence" },
        skinToneCheckboxes: [],
        translate: (key, fallback) =>
          key === "sequenceJoiner" ? "Joined sequence" : fallback,
        versionMode: "selected",
        versionSliderLabel: (version) => `Emoji ${version}`,
        versionValue: "17.0",
      });

      assert.equal(
        replacements[0]?.toText(),
        "Joined sequence · Only Emoji 17.0",
      );

      replacements.length = 0;
      updateActiveFilterSummary({
        activeFilterSummary: activeFilterSummary as any,
        activeFilterText: activeFilterText as any,
        displayGroupName: () => "",
        displayUnicodeSubGroupName: () => "",
        genderCheckboxes: [],
        hairCheckboxes: [],
        latestReleased: "17.0",
        orderMode: "unicode",
        searchText: "   ",
        selectedGroup: "",
        selectedSequenceType: "",
        selectedSubGroup: "",
        sequenceTranslationKeys: {},
        sequenceTypeLabels: {},
        skinToneCheckboxes: [],
        translate: (_key, fallback) => fallback,
        versionMode: "through",
        versionSliderLabel: (version) => version,
        versionValue: "17.0",
      });

      assert.equal(activeFilterSummary.hidden, true);
      assert.equal(replacements[0]?.toText(), "");
    } finally {
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, "document");
      }
    }
  });
});
