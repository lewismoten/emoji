import assert from "node:assert/strict";
import { createEmojiListRenderers } from "../../src/explorer/emoji-list-render.js";

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

  const popularRenderers = createEmojiListRenderers({
    applyPixelArtworkClass() {},
    byId: () => ({
      alpha: { group: "Objects", order: 20, subGroup: "Mail", unicodeSubGroup: "mail" },
      beta: { group: "Objects", order: 10, subGroup: "Mail", unicodeSubGroup: "mail" },
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

  const orderedUnicode = renderers.orderedKeys(["alpha", "beta", "gamma"]);
  assert.deepEqual(orderedUnicode, ["gamma", "beta", "alpha"]);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
