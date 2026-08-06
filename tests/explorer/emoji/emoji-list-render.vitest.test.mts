import { afterEach, beforeEach, describe, expect, it } from "vitest";

import * as sharedState from "../../../src/state.js";
import {
  installEmojiRenderDocument,
  makeRenderers,
  makeState,
  populateSequenceState,
} from "../../shared/emoji-list-render-fixtures.js";

// Pairing source: ../../../src/explorer/emoji/emoji-list-render.js

describe("emoji-list-render", () => {
  let restoreDocument = () => {};

  beforeEach(() => {
    restoreDocument = installEmojiRenderDocument();
  });

  afterEach(() => {
    sharedState.byId.clear();
    sharedState.emojiByKey.clear();
    sharedState.searchAnnotations.clear();
    sharedState.subGroups.clear();
    restoreDocument();
  });

  it("renders group headings, cells, and unicode subgroup transitions", () => {
    const pixelCalls: string[] = [];
    const renderers = makeRenderers({
      applyPixelArtworkClass(_element: Element | null, key: string) {
        pixelCalls.push(key);
      },
      byId: () => ({
        alpha: {
          group: "Objects",
          hasExplorerSections: true,
          order: 20,
          shortName: "Alpha",
          subGroup: "Mail",
          unicodeSubGroup: "mail",
        },
        beta: {
          group: "Objects",
          hasExplorerSections: false,
          order: 10,
          shortName: "Beta",
          subGroup: "Mail",
          unicodeSubGroup: "mail",
        },
        gamma: {
          group: "Smileys & Emotion",
          hasExplorerSections: true,
          order: 5,
          shortName: "Gamma",
          subGroup: "face-smiling",
          unicodeSubGroup: "face-smiling",
        },
      }),
      displayExplorerLabel: (name: string) => `explorer:${name}`,
      displayGroupName: (name: string) => `group:${name}`,
      displayUnicodeSubGroupName: (name: string) => `unicode:${name}`,
      emojiByKey: () => ({ alpha: "📫", beta: "📪", gamma: "😀" }),
      focusedEmojiKey: () => "beta",
      getIntroducedVersion: (key: string) => (key === "alpha" ? "15.0" : "—"),
      groups: () => ["Objects", "Smileys & Emotion"],
      orderMode: () => "unicode",
      popularKeys: () => ["beta", "alpha", "gamma"],
      searchAnnotations: () => ({ alpha: ["Mailbox"] }),
      sequenceTranslationKeys: { modifier: "modifier", zwj: "zwj" },
      sequenceTypeLabels: { modifier: "Modifier", zwj: "ZWJ" },
      sequenceTypeOrder: ["single", "modifier", "zwj"],
      subGroups: () => ({
        Objects: ["mail"],
        "Smileys & Emotion": ["face-smiling"],
      }),
    });

    expect((renderers.asGroup("Objects") as any).childNodes[0].innerText).toBe("group:Objects");
    expect((renderers.asUnicodeSubGroup("mail") as any).childNodes[0].innerText).toBe("unicode:mail");
    expect((renderers.asSubGroup("Mail", true) as any).className).toBe("subgroup is-direct");

    const cell = renderers.asEmojiCell("alpha", 2, 3) as any;
    expect(cell.title).toBe("Mailbox");
    expect(cell.tabIndex).toBe(-1);
    expect(cell.attributes.get("aria-label")).toBe("Mailbox, Emoji version 15.0");
    expect(cell.classList.values).toEqual(["group-2", "sub-group-3"]);
    expect(pixelCalls).toEqual(["alpha"]);

    const fallbackName = makeRenderers({
      byId: () => ({}),
      displayUnicodeSubGroupName: (name: string) => name,
      emojiByKey: () => ({ smilingFace: "😀" }),
      getIntroducedVersion: () => "16.0",
      searchAnnotations: () => ({}),
      subGroups: () => ({}),
    });
    expect((fallbackName.asEmojiCell("smilingFace", 0, 0) as any).title).toBe("Smiling face");

    const groupedState = makeState({
      group: "Unassigned",
      groupElement: null,
      subGroup: "Unassigned",
      subGroupElement: null,
      unicodeSubGroup: "Unassigned",
      unicodeSubGroupElement: null,
    });
    renderers.asItem(groupedState as any, "alpha");
    renderers.flushEmojiCellFragment(groupedState as any);
    expect((groupedState as any).subGroupElement.className).toBe("subgroup is-direct");

    const unicodeShift = makeState({
      group: "Objects",
      groupElement: (groupedState as any).groupElement,
      subGroup: "Mail",
      subGroupElement: (groupedState as any).subGroupElement,
      unicodeSubGroup: "mail",
      unicodeSubGroupElement: (groupedState as any).unicodeSubGroupElement,
    });
    makeRenderers({
      byId: () => ({
        alpha: {
          group: "Objects",
          hasExplorerSections: true,
          order: 20,
          shortName: "Alpha",
          subGroup: "Other",
          unicodeSubGroup: "other",
        },
      }),
      displayExplorerLabel: (name: string) => `explorer:${name}`,
      displayGroupName: (name: string) => `group:${name}`,
      displayUnicodeSubGroupName: (name: string) => `unicode:${name}`,
      emojiByKey: () => ({ alpha: "📫" }),
      groups: () => ["Objects"],
      orderMode: () => "unicode",
      subGroups: () => ({ Objects: ["mail", "other"] }),
    }).asItem(unicodeShift as any, "alpha");
    expect((unicodeShift as any).unicodeSubGroup).toBe("other");
  });

  it("renders popular, ungrouped, and sequence ordering branches", () => {
    const popularRenderers = makeRenderers({
      byId: () => ({
        alpha: {
          group: "Objects",
          hasExplorerSections: true,
          order: 20,
          shortName: "Alpha",
          subGroup: "Mail",
          unicodeSubGroup: "mail",
        },
        beta: {
          group: "Objects",
          hasExplorerSections: true,
          order: 10,
          shortName: "Beta",
          subGroup: "Mail",
          unicodeSubGroup: "mail",
        },
      }),
      displayExplorerLabel: (name: string) => `explorer:${name}`,
      displayGroupName: (name: string) => `group:${name}`,
      emojiByKey: () => ({ alpha: "📫", beta: "📪" }),
      focusedEmojiKey: () => "alpha",
      groups: () => ["Objects"],
      orderMode: () => "popular",
      popularKeys: () => ["beta", "alpha"],
    });
    const popularState = makeState();
    popularRenderers.asItem(popularState as any, "alpha");
    popularRenderers.flushEmojiCellFragment(popularState as any);
    expect((popularState as any).group).toBe("Top 2");
    expect((popularState as any).emoji.childNodes).toHaveLength(1);

    const noGroupsRenderers = makeRenderers({
      emojiByKey: () => ({ orphan: "🪄" }),
    });
    const noGroupsState = makeState();
    noGroupsRenderers.asItem(noGroupsState as any, "orphan");
    expect((noGroupsState as any).items[0].id).toBe("orphan");

    const globalStateBranch = makeState();
    makeRenderers({
      emojiByKey: () => ({ delta: "✨" }),
      groups: () => ["Objects"],
      subGroups: () => ({ Objects: ["mail"] }),
    }).asItem(
      globalStateBranch as any,
      "delta",
      {
        byId: {
          get: () => ({
            group: "Objects",
            hasExplorerSections: false,
            subGroup: "Misc",
            unicodeSubGroup: "mail",
          }),
        },
        subGroups: {
          get: () => ["mail"],
        },
      } as any,
    );
    expect((globalStateBranch as any).items).toHaveLength(1);

    const subgroupShiftState = makeState({
      group: "Objects",
      groupElement: { appendChild() {} },
      subGroup: "Mail",
      subGroupElement: { className: "subgroup", lastElementChild: { appendChild() {} } },
      unicodeSubGroup: "mail",
      unicodeSubGroupElement: { lastChild: { appendChild() {} } },
    });
    makeRenderers({
      byId: () => ({
        alpha: {
          group: "Objects",
          hasExplorerSections: true,
          order: 20,
          shortName: "Alpha",
          subGroup: "Other",
          unicodeSubGroup: "mail",
        },
      }),
      displayExplorerLabel: (name: string) => `explorer:${name}`,
      displayGroupName: (name: string) => `group:${name}`,
      emojiByKey: () => ({ alpha: "📫" }),
      groups: () => ["Objects"],
      subGroups: () => ({ Objects: ["mail"] }),
    }).asItem(subgroupShiftState as any, "alpha");
    expect((subgroupShiftState as any).subGroup).toBe("Other");

    populateSequenceState(sharedState);
    const sequenceRenderers = makeRenderers({
      byId: () => ({
        alpha: { order: 20, sequenceType: "zwj" },
        beta: { order: 10, sequenceType: "modifier" },
        gamma: { order: 5, sequenceType: "single" },
      }),
      emojiByKey: () => ({ alpha: "🧑‍🚀", beta: "👍🏻", gamma: "😀" }),
      focusedEmojiKey: () => "gamma",
      orderMode: () => "sequence",
      popularKeys: () => ["beta", "alpha", "gamma"],
      sequenceTranslationKeys: {
        modifier: "modifier-label",
        single: "single-label",
        zwj: "zwj-label",
      },
      sequenceTypeLabels: {
        modifier: "Modifier",
        single: "Single",
        zwj: "ZWJ",
      },
      sequenceTypeOrder: ["single", "modifier", "zwj"],
      translate: (key: string, fallback: string) => `${key}:${fallback}`,
    });
    const sequenceState = makeState({ type: "modifier" });
    sequenceRenderers.asSequenceItem(sequenceState as any, "beta");
    sequenceRenderers.asSequenceItem(sequenceState as any, "alpha");
    sequenceRenderers.flushEmojiCellFragment(sequenceState as any);
    expect((sequenceState as any).items[0].childNodes[0].innerText).toBe("zwj-label:ZWJ");
    expect(sequenceRenderers.orderedKeys(["alpha", "beta", "gamma"])).toEqual(["gamma", "beta", "alpha"]);
    sharedState.byId.set("delta", {
      codePoints: "1F603",
      emoji: "😃",
      group: "Smileys & Emotion",
      key: "delta",
      order: 1,
      sequenceType: "single",
      shortName: "Delta",
      status: "fully-qualified",
      subGroup: "face-smiling",
      unicodeSubGroup: "face-smiling",
    });
    expect(sequenceRenderers.orderedKeys(["gamma", "delta"])).toEqual(["delta", "gamma"]);
    expect(popularRenderers.orderedKeys(["alpha", "beta", "gamma"])).toEqual(["beta", "alpha", "gamma"]);
    expect(noGroupsRenderers.orderedKeys(["beta", "alpha"])).toEqual(["beta", "alpha"]);
  });
});
