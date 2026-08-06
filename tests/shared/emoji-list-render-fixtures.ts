import { createEmojiListRenderers } from "../../src/explorer/emoji/emoji-list-render.js";

export class FakeClassList {
  values: string[] = [];

  add(value: string) {
    this.values.push(value);
  }
}

export class FakeElement {
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

export class FakeFragment {
  childNodes: any[] = [];

  appendChild(node: any) {
    this.childNodes.push(node);
    return node;
  }

  hasChildNodes() {
    return this.childNodes.length > 0;
  }
}

export const installEmojiRenderDocument = () => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
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
  return () => {
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  };
};

export const makeRenderers = (overrides: Record<string, unknown> = {}) =>
  createEmojiListRenderers({
    applyPixelArtworkClass() {},
    displayExplorerLabel: (name: string) => name,
    displayGroupName: (name: string) => name,
    focusedEmojiKey: () => "",
    getIntroducedVersion: () => "—",
    groups: () => [],
    orderMode: () => "grouped",
    popularKeys: () => [],
    sequenceTranslationKeys: {},
    sequenceTypeLabels: {},
    sequenceTypeOrder: ["single"],
    translate: (_key: string, fallback: string) => fallback,
    unassigned: "Unassigned",
    ...overrides,
  });

export const makeState = (overrides: Record<string, unknown> = {}) => ({
  cellFragment: new FakeFragment(),
  items: [],
  ...overrides,
});

export const populateSequenceState = (
  sharedState: typeof import("../../src/state.js"),
) => {
  sharedState.byId.replace({
    alpha: {
      codePoints: "1F9D1 200D 1F680",
      emoji: "🧑‍🚀",
      group: "People & Body",
      key: "alpha",
      order: 20,
      sequenceType: "zwj",
      shortName: "Alpha",
      status: "fully-qualified",
      subGroup: "person-role",
      unicodeSubGroup: "person-role",
    },
    beta: {
      codePoints: "1F44D 1F3FB",
      emoji: "👍🏻",
      group: "People & Body",
      key: "beta",
      order: 10,
      sequenceType: "modifier",
      shortName: "Beta",
      status: "fully-qualified",
      subGroup: "hand-fingers-closed",
      unicodeSubGroup: "hand-fingers-closed",
    },
    gamma: {
      codePoints: "1F600",
      emoji: "😀",
      group: "Smileys & Emotion",
      key: "gamma",
      order: 5,
      sequenceType: "single",
      shortName: "Gamma",
      status: "fully-qualified",
      subGroup: "face-smiling",
      unicodeSubGroup: "face-smiling",
    },
  });
};
