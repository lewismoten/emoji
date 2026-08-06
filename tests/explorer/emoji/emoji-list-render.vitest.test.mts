import { afterEach, describe, expect, it } from "vitest";

import { createEmojiListRenderers } from "../../../src/explorer/emoji/emoji-list-render.js";

class FakeClassList {
  values: string[] = [];

  add(value: string) {
    this.values.push(value);
  }
}

class FakeElement {
  className = "";
  innerText = "";
  textContent = "";
  type = "";
  id = "";
  title = "";
  tabIndex = -1;
  dataset: Record<string, string> = {};
  childNodes: any[] = [];
  classList = new FakeClassList();
  attributes = new Map<string, string>();

  constructor(readonly tagName: string) {}

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  get lastChild() {
    return this.childNodes.at(-1) ?? null;
  }

  get lastElementChild() {
    return this.childNodes.at(-1) ?? null;
  }
}

class FakeFragment {
  childNodes: any[] = [];

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }
}

describe("emoji-list-render", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("renders grouped, unicode, and fallback emoji list structures", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createDocumentFragment() {
          return new FakeFragment();
        },
        createElement(tagName: string) {
          return new FakeElement(tagName);
        },
      },
    });

    const pixelCalls: string[] = [];
    const renderers = createEmojiListRenderers({
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
          sequenceType: "modifier",
          shortName: "Beta",
          subGroup: "Mail",
          unicodeSubGroup: "mail",
        },
        gamma: {
          group: "Smileys & Emotion",
          hasExplorerSections: true,
          order: 5,
          sequenceType: "zwj",
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
      translate: (_key: string, fallback: string) => fallback,
      unassigned: "Unassigned",
    });

    const group = renderers.asGroup("Objects") as any;
    expect(group.className).toBe("group");
    expect(group.childNodes[0].innerText).toBe("group:Objects");

    const unicodeSubGroup = renderers.asUnicodeSubGroup("mail") as any;
    expect(unicodeSubGroup.className).toBe("unicode-subgroup");
    expect(unicodeSubGroup.childNodes[0].innerText).toBe("unicode:mail");

    const subGroup = renderers.asSubGroup("Mail", true) as any;
    expect(subGroup.className).toBe("subgroup is-direct");
    expect(subGroup.childNodes[0].innerText).toBe("explorer:Mail");

    const cell = renderers.asEmojiCell("alpha", 2, 3) as any;
    expect(cell.id).toBe("alpha");
    expect(cell.title).toBe("Mailbox");
    expect(cell.tabIndex).toBe(-1);
    expect(cell.attributes.get("aria-label")).toBe("Mailbox, Emoji version 15.0");
    expect(cell.classList.values).toEqual(["group-2", "sub-group-3"]);
    expect(pixelCalls).toEqual(["alpha"]);

    const fallbackCell = renderers.asEmojiCell("gamma", 0, 0) as any;
    expect(fallbackCell.title).toBe("Gamma");
    expect(fallbackCell.tabIndex).toBe(-1);
    expect(fallbackCell.attributes.get("aria-label")).toBe("Gamma");

    const fallbackNameRenderers = createEmojiListRenderers({
      applyPixelArtworkClass() {},
      byId: () => ({}),
      displayExplorerLabel: (name: string) => name,
      displayGroupName: (name: string) => name,
      displayUnicodeSubGroupName: (name: string) => name,
      emojiByKey: () => ({ smilingFace: "😀" }),
      focusedEmojiKey: () => "",
      getIntroducedVersion: () => "16.0",
      groups: () => [],
      orderMode: () => "grouped",
      popularKeys: () => [],
      searchAnnotations: () => ({}),
      sequenceTranslationKeys: {},
      sequenceTypeLabels: {},
      sequenceTypeOrder: ["single"],
      subGroups: () => ({}),
      translate: (_key: string, fallback: string) => fallback,
      unassigned: "Unassigned",
    });
    const displayKeyCell = fallbackNameRenderers.asEmojiCell(
      "smilingFace",
      0,
      0,
    ) as any;
    expect(displayKeyCell.title).toBe("Smiling face");
    expect(displayKeyCell.attributes.get("aria-label")).toBe(
      "Smiling face, Emoji version 16.0",
    );

    const groupedState: any = {
      cellFragment: new FakeFragment(),
      group: "Unassigned",
      groupElement: null,
      items: [],
      subGroup: "Unassigned",
      subGroupElement: null,
      unicodeSubGroup: "Unassigned",
      unicodeSubGroupElement: null,
    };
    renderers.asItem(groupedState, "alpha");
    renderers.flushEmojiCellFragment(groupedState);
    expect(groupedState.items).toHaveLength(1);
    expect(groupedState.groupElement.className).toBe("group");
    expect(groupedState.subGroupElement.className).toBe("subgroup is-direct");

    const continuedState: any = {
      cellFragment: new FakeFragment(),
      group: "Objects",
      groupElement: groupedState.groupElement,
      items: [],
      subGroup: "Mail",
      subGroupElement: groupedState.subGroupElement,
      unicodeSubGroup: "mail",
      unicodeSubGroupElement: groupedState.unicodeSubGroupElement,
    };
    renderers.asItem(continuedState, "beta");
    renderers.flushEmojiCellFragment(continuedState);
    expect(continuedState.subGroupElement.className).toBe("subgroup is-direct");

    const unicodeShiftState: any = {
      cellFragment: new FakeFragment(),
      group: "Objects",
      groupElement: groupedState.groupElement,
      items: [],
      subGroup: "Mail",
      subGroupElement: groupedState.subGroupElement,
      unicodeSubGroup: "mail",
      unicodeSubGroupElement: groupedState.unicodeSubGroupElement,
    };
    const shiftedRenderers = createEmojiListRenderers({
      applyPixelArtworkClass() {},
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
      focusedEmojiKey: () => "",
      getIntroducedVersion: () => "—",
      groups: () => ["Objects"],
      orderMode: () => "unicode",
      popularKeys: () => [],
      searchAnnotations: () => ({}),
      sequenceTranslationKeys: {},
      sequenceTypeLabels: {},
      sequenceTypeOrder: ["single"],
      subGroups: () => ({ Objects: ["mail", "other"] }),
      translate: (_key: string, fallback: string) => fallback,
      unassigned: "Unassigned",
    });
    shiftedRenderers.asItem(unicodeShiftState, "alpha");
    shiftedRenderers.flushEmojiCellFragment(unicodeShiftState);
    expect(unicodeShiftState.unicodeSubGroup).toBe("other");
    expect(
      unicodeShiftState.unicodeSubGroupElement.lastChild.childNodes.length > 0,
    ).toBe(true);
  });
});
