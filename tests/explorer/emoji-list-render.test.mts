import assert from "node:assert/strict";
import { createEmojiListRenderers } from "../../src/explorer/emoji/emoji-list-render.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

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

try {
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
  assert.equal(group.className, "group");
  assert.equal(group.childNodes[0].innerText, "group:Objects");

  const unicodeSubGroup = renderers.asUnicodeSubGroup("mail") as any;
  assert.equal(unicodeSubGroup.className, "unicode-subgroup");
  assert.equal(unicodeSubGroup.childNodes[0].innerText, "unicode:mail");

  const subGroup = renderers.asSubGroup("Mail", true) as any;
  assert.equal(subGroup.className, "subgroup is-direct");
  assert.equal(subGroup.childNodes[0].innerText, "explorer:Mail");

  const cell = renderers.asEmojiCell("alpha", 2, 3) as any;
  assert.equal(cell.id, "alpha");
  assert.equal(cell.title, "Mailbox");
  assert.equal(cell.tabIndex, -1);
  assert.equal(cell.attributes.get("aria-label"), "Mailbox, Emoji version 15.0");
  assert.deepEqual(cell.classList.values, ["group-2", "sub-group-3"]);
  assert.deepEqual(pixelCalls, ["alpha"]);

  const fallbackCell = renderers.asEmojiCell("gamma", 0, 0) as any;
  assert.equal(fallbackCell.title, "Gamma");
  assert.equal(fallbackCell.tabIndex, -1);
  assert.equal(fallbackCell.attributes.get("aria-label"), "Gamma");

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
  assert.equal(displayKeyCell.title, "Smiling face");
  assert.equal(
    displayKeyCell.attributes.get("aria-label"),
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
  assert.equal(groupedState.items.length, 1);
  assert.equal(groupedState.groupElement.className, "group");
  assert.equal(groupedState.subGroupElement.className, "subgroup is-direct");

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
  assert.equal(continuedState.subGroupElement.className, "subgroup is-direct");

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
  assert.equal(unicodeShiftState.unicodeSubGroup, "other");
  assert.equal(
    unicodeShiftState.unicodeSubGroupElement.lastChild.childNodes.length > 0,
    true,
  );

  const noGroupsRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      lone: {
        group: "Ungrouped",
        hasExplorerSections: false,
        order: 1,
        shortName: "Lone",
        subGroup: "misc",
        unicodeSubGroup: "misc",
      },
    }),
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    emojiByKey: () => ({ lone: "🪁" }),
    focusedEmojiKey: () => "lone",
    getIntroducedVersion: () => "—",
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
  const noGroupsState: any = {
    cellFragment: new FakeFragment(),
    items: [],
  };
  const focusedCell = noGroupsRenderers.asEmojiCell("lone", 0, 0) as any;
  assert.equal(focusedCell.tabIndex, 0);
  noGroupsRenderers.asItem(noGroupsState, "lone");
  assert.equal(noGroupsState.items.length, 1);
  assert.equal(noGroupsState.items[0].id, "lone");
  assert.equal(noGroupsState.items[0].tabIndex, 0);
  noGroupsRenderers.asItem(noGroupsState, "missing");
  assert.equal(noGroupsState.items[1].id, "missing");

  const sequenceState: any = {
    cellFragment: new FakeFragment(),
    emoji: null,
    items: [],
    type: "",
  };
  renderers.asSequenceItem(sequenceState, "beta");
  renderers.flushEmojiCellFragment(sequenceState);
  assert.equal(sequenceState.items[0].className, "sequence-type");
  assert.equal(sequenceState.items[0].childNodes[0].innerText, "Modifier");
  renderers.asSequenceItem(sequenceState, "gamma");
  renderers.flushEmojiCellFragment(sequenceState);
  assert.equal(sequenceState.items.length, 2);
  assert.equal(sequenceState.items[1].childNodes[0].innerText, "ZWJ");

  const fallbackSequenceRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      plain: { order: 1, sequenceType: "mystery", shortName: "Plain" },
    }),
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    emojiByKey: () => ({ plain: "🙂" }),
    focusedEmojiKey: () => "",
    getIntroducedVersion: () => "—",
    groups: () => [],
    orderMode: () => "sequence",
    popularKeys: () => [],
    searchAnnotations: () => ({}),
    sequenceTranslationKeys: {},
    sequenceTypeLabels: {},
    sequenceTypeOrder: ["single"],
    subGroups: () => ({}),
    translate: (_key: string, fallback: string) => fallback,
    unassigned: "Unassigned",
  });
  const fallbackSequenceState: any = {
    cellFragment: new FakeFragment(),
    emoji: null,
    items: [],
    type: "",
  };
  fallbackSequenceRenderers.asSequenceItem(fallbackSequenceState, "plain");
  fallbackSequenceRenderers.flushEmojiCellFragment(fallbackSequenceState);
  assert.equal(fallbackSequenceState.items[0].childNodes[0].innerText, "mystery");

  const popularRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      alpha: {
        group: "Objects",
        order: 20,
        subGroup: "Mail",
        unicodeSubGroup: "mail",
      },
      beta: {
        group: "Objects",
        order: 10,
        subGroup: "Mail",
        unicodeSubGroup: "mail",
      },
      missing: {
        group: "Objects",
        order: 99,
        subGroup: "Mail",
        unicodeSubGroup: "mail",
      },
    }),
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    emojiByKey: () => ({ alpha: "📫", beta: "📪" }),
    focusedEmojiKey: () => "",
    getIntroducedVersion: () => "—",
    groups: () => ["Objects"],
    orderMode: () => "popular",
    popularKeys: () => ["beta", "alpha"],
    searchAnnotations: () => ({}),
    sequenceTranslationKeys: {},
    sequenceTypeLabels: {},
    sequenceTypeOrder: ["single"],
    subGroups: () => ({ Objects: ["mail"] }),
    translate: (_key: string, fallback: string) => fallback,
    unassigned: "Unassigned",
  });
  const popularState: any = {
    cellFragment: new FakeFragment(),
    group: "",
    groupElement: null,
    items: [],
    subGroup: "",
    subGroupElement: null,
    unicodeSubGroup: "",
  };
  popularRenderers.asItem(popularState, "beta");
  assert.equal(popularState.group, "Top 2");
  popularRenderers.flushEmojiCellFragment(popularState);
  assert.equal(popularState.items.length, 1);
  popularRenderers.asItem(popularState, "alpha");
  popularRenderers.flushEmojiCellFragment(popularState);
  assert.equal(popularState.items[0].childNodes[0].innerText, "Top 2");
  popularRenderers.asItem(popularState, "missing");
  assert.equal(popularState.group, "Top 0");

  const orderedPopular = popularRenderers.orderedKeys(["alpha", "missing", "beta"]);
  assert.deepEqual(orderedPopular, ["beta", "alpha", "missing"]);

  const subgroupShiftRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      alpha: {
        group: "Objects",
        hasExplorerSections: true,
        order: 2,
        sequenceType: "single",
        shortName: "Alpha",
        subGroup: "First subgroup",
        unicodeSubGroup: "mail",
      },
      beta: {
        group: "Objects",
        hasExplorerSections: true,
        order: 1,
        sequenceType: "modifier",
        shortName: "Beta",
        subGroup: "Second subgroup",
        unicodeSubGroup: "mail",
      },
    }),
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    emojiByKey: () => ({ alpha: "📫", beta: "📪", missing: "❓" }),
    focusedEmojiKey: () => "",
    getIntroducedVersion: () => "—",
    groups: () => ["Objects"],
    orderMode: () => "sequence",
    popularKeys: () => [],
    searchAnnotations: () => ({}),
    sequenceTranslationKeys: { modifier: "modifier", single: "single" },
    sequenceTypeLabels: { modifier: "Modifier", single: "Single" },
    sequenceTypeOrder: ["modifier", "single"],
    subGroups: () => ({ Objects: ["mail"] }),
    translate: (_key: string, fallback: string) => fallback,
    unassigned: "Unassigned",
  });
  const subgroupShiftState: any = {
    cellFragment: new FakeFragment(),
    group: "Objects",
    groupElement: groupedState.groupElement,
    items: [],
    subGroup: "Old subgroup",
    subGroupElement: groupedState.subGroupElement,
    unicodeSubGroup: "mail",
    unicodeSubGroupElement: groupedState.unicodeSubGroupElement,
  };
  subgroupShiftRenderers.asItem(subgroupShiftState, "alpha");
  subgroupShiftRenderers.flushEmojiCellFragment(subgroupShiftState);
  assert.equal(subgroupShiftState.subGroup, "First subgroup");
  assert.deepEqual(
    subgroupShiftRenderers.orderedKeys(["alpha", "beta"]),
    ["beta", "alpha"],
  );

  const groupedOrderRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      a: { order: 99 },
      b: { order: 1 },
    }),
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    emojiByKey: () => ({ a: "a", b: "b" }),
    focusedEmojiKey: () => "",
    getIntroducedVersion: () => "—",
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
  assert.deepEqual(groupedOrderRenderers.orderedKeys(["a", "b"]), ["a", "b"]);

  const orderedUnicode = renderers.orderedKeys(["alpha", "beta", "gamma"]);
  assert.deepEqual(orderedUnicode, ["gamma", "beta", "alpha"]);

  const emptyFragmentState: any = {
    cellFragment: new FakeFragment(),
    emoji: null,
    items: [],
    subGroupElement: null,
  };
  renderers.flushEmojiCellFragment(emptyFragmentState);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
