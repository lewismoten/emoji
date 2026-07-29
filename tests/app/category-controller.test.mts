import assert from "node:assert/strict";
import { createCategoryController } from "../../src/app/category-controller.js";

class FakeClassList {
  names = new Set<string>();

  add(name: string) {
    this.names.add(name);
  }

  remove(name: string) {
    this.names.delete(name);
  }

  toggle(name: string, force?: boolean) {
    if (force === true) {
      this.names.add(name);
      return true;
    }
    if (force === false) {
      this.names.delete(name);
      return false;
    }
    if (this.names.has(name)) {
      this.names.delete(name);
      return false;
    }
    this.names.add(name);
    return true;
  }

  contains(name: string) {
    return this.names.has(name);
  }

  toString() {
    return [...this.names].join(" ");
  }

  fromString(value: string) {
    this.names = new Set(value.split(/\s+/).filter(Boolean));
  }
}

class FakeElement {
  tagName: string;
  ownerDocument: FakeDocument;
  children: Array<FakeElement | string> = [];
  parentElement: FakeElement | null = null;
  attributes = new Map<string, string>();
  classList = new FakeClassList();
  dataset: Record<string, string> = {};
  hidden = false;
  disabled = false;
  value = "";
  textContent = "";
  title = "";
  open = false;
  tabIndex = -1;

  constructor(tagName: string, ownerDocument: FakeDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
  }

  set className(value: string) {
    this.classList.fromString(value);
  }

  get className() {
    return this.classList.toString();
  }

  set text(value: string) {
    this.textContent = value;
  }

  get text() {
    return this.textContent;
  }

  append(...nodes: Array<FakeElement | string>) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node: FakeElement | string) {
    this.children.push(node);
    if (node instanceof FakeElement) node.parentElement = this;
    return node;
  }

  replaceChildren(...nodes: Array<FakeElement | string>) {
    this.children = [];
    nodes.forEach((node) => this.appendChild(node));
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "class") this.className = value;
    if (name === "tabindex") this.tabIndex = Number(value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener() {}

  focus() {
    this.ownerDocument.activeElement = this;
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (matchesSelector(current, selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  querySelector<T = FakeElement>(selector: string) {
    return (this.querySelectorAll(selector)[0] ?? null) as T | null;
  }

  querySelectorAll<T = FakeElement>(selector: string) {
    const matches: FakeElement[] = [];
    const visit = (node: FakeElement | string) => {
      if (!(node instanceof FakeElement)) return;
      if (matchesSelector(node, selector)) matches.push(node);
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return matches as T[];
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: 24,
      height: 24,
    };
  }

  get options() {
    if (this.tagName !== "SELECT") return [];
    return this.children.flatMap((child) => {
      if (!(child instanceof FakeElement)) return [];
      if (child.tagName === "OPTION") return [child];
      if (child.tagName === "OPTGROUP") {
        return child.children.filter(
          (grandchild): grandchild is FakeElement =>
            grandchild instanceof FakeElement &&
            grandchild.tagName === "OPTION",
        );
      }
      return [];
    });
  }
}

class FakeDocument {
  head = new FakeElement("head", this);
  activeElement: FakeElement | null = null;
  documentElement = { dir: "ltr" };

  createElement(tagName: string) {
    return new FakeElement(tagName, this);
  }

  getElementById(id: string) {
    return (
      this.head.querySelector<FakeElement>(`#${id}`) ??
      this.head.children.find(
        (child) =>
          child instanceof FakeElement && child.getAttribute("id") === id,
      ) ??
      null
    );
  }
}

const matchesSelector = (element: FakeElement, selector: string) => {
  if (selector.startsWith(".")) {
    return element.classList.contains(selector.slice(1));
  }
  if (selector.startsWith("#")) {
    return element.getAttribute("id") === selector.slice(1);
  }
  if (selector === '[role="radio"]') {
    return element.getAttribute("role") === "radio";
  }
  if (selector === '[aria-checked="true"]') {
    return element.getAttribute("aria-checked") === "true";
  }
  return false;
};

const runtime: any = globalThis;
const originalDocument = runtime.document;
const originalWindow = runtime.window;
const documentRef = new FakeDocument();

runtime.document = documentRef as unknown;
runtime.window = {
  requestAnimationFrame(callback: (...args: any[]) => void) {
    callback(0);
    return 1;
  },
};

const createTrigger = () => {
  const trigger = documentRef.createElement("button");
  const kind = documentRef.createElement("span");
  kind.className = "filter-picker-kind";
  const emoji = documentRef.createElement("span");
  emoji.className = "filter-picker-emoji";
  const value = documentRef.createElement("span");
  value.className = "filter-picker-value";
  trigger.append(kind, emoji, value);
  return trigger;
};

const createField = () => {
  const field = documentRef.createElement("div");
  field.className = "filter-field";
  return field;
};

const createSelect = (field: FakeElement) => {
  const select = documentRef.createElement("select");
  field.append(select);
  return select;
};

const groupField = createField();
const subGroupField = createField();
const sequenceField = createField();
const groupSelector = createSelect(groupField);
const subGroupSelector = createSelect(subGroupField);
const sequenceTypeSelector = createSelect(sequenceField);
const compactGroupChoices = documentRef.createElement("div");
compactGroupChoices.className = "compact-group-choices";
const compactSubGroupChoices = documentRef.createElement("div");
compactSubGroupChoices.className = "compact-subgroup-choices";
const compactSequenceChoices = documentRef.createElement("div");
compactSequenceChoices.className = "compact-sequence-choices";
const compactGroupLabel = documentRef.createElement("span");
const compactSubGroupLabel = documentRef.createElement("span");
const compactSequenceLabel = documentRef.createElement("span");
const groupFilterDialog = documentRef.createElement("dialog");
const subGroupFilterDialog = documentRef.createElement("dialog");
const groupPickerTrigger = createTrigger();
const subGroupPickerTrigger = createTrigger();

const makeOrderButton = (order: string) => {
  const button = documentRef.createElement("button");
  button.dataset.order = order;
  return button;
};

const unicodeButton = makeOrderButton("unicode");
const sequenceButton = makeOrderButton("sequence");
const groupsButton = makeOrderButton("groups");

const state = {
  searchLabels: {
    all: "Everything",
    group: "Group",
    subgroup: "Sub-group",
    zwjLabel: "ZWJ Sequences",
    smileysLabel: "Localized Smileys",
    faceSmilingLabel: "Localized Faces",
  },
  searchSubgroupLabels: {
    "face-smiling": "Localized Smiling Faces",
  },
  groups: ["Smileys & Emotion", "Objects"],
  items: [
    {
      key: "grinningFace",
      emoji: "😀",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      sequenceType: "single",
      order: 1,
    },
    {
      key: "smilingFaceWithHalo",
      emoji: "😇",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      sequenceType: "single",
      order: 2,
    },
    {
      key: "laptop",
      emoji: "💻",
      group: "Objects",
      unicodeSubGroup: "computer",
      sequenceType: "single",
      order: 3,
    },
    {
      key: "familyManWomanGirl",
      emoji: "👨‍👩‍👧",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      sequenceType: "zwj",
      order: 4,
    },
  ],
  proposedVersionManifests: [{ version: "18.0", status: "draft" }],
  versionManifests: [{ version: "17.0" }],
  subGroups: {
    "Smileys & Emotion": ["face-smiling"],
    Objects: ["computer"],
  },
  versionKeys: new Map<string, Set<string>>([
    ["17.0", new Set(["grinningFace", "smilingFaceWithHalo", "laptop"])],
    ["18.0", new Set(["familyManWomanGirl"])],
  ]),
  groupRepresentativeEmoji: new Map<string, string>(),
  subGroupRepresentativeEmoji: new Map<string, string>(),
  selectedGroup: "",
  selectedSubGroup: "",
  selectedSequenceType: "",
  orderMode: "unicode",
  availableGroups: [] as string[],
  availableSequenceTypes: [] as string[],
  availableSubGroups: {} as Record<string, string[]>,
  availableCategoryKeys: [] as string[],
};

const drawListCalls: string[] = [];
const savePreferenceCalls: string[][] = [];
let syncVersionRangeCalls = 0;
let developerModeEnabled = false;

const controller = createCategoryController({
  compactGroupChoices: () => compactGroupChoices,
  compactGroupLabel: () => compactGroupLabel,
  compactSequenceChoices: () => compactSequenceChoices,
  compactSequenceLabel: () => compactSequenceLabel,
  compactSubGroupChoices: () => compactSubGroupChoices,
  compactSubGroupLabel: () => compactSubGroupLabel,
  developerModeEnabled: () => developerModeEnabled,
  drawList: () => {
    drawListCalls.push("draw");
  },
  getVersionKeys: () => new Set(["grinningFace", "familyManWomanGirl"]),
  groupFilterDialog: () => groupFilterDialog,
  groupPickerTrigger: () => groupPickerTrigger,
  groupSelector: () => groupSelector,
  orderButtons: () => [unicodeButton, sequenceButton, groupsButton],
  savePreference: (key: string, value: string) => {
    savePreferenceCalls.push([key, value]);
  },
  sequenceTranslationKeys: { single: "singleLabel", zwj: "zwjLabel" },
  sequenceTypeEmoji: { single: "🙂", zwj: "🧩" },
  sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
  sequenceTypeOrder: ["single", "zwj"],
  sequenceTypeSelector: () => sequenceTypeSelector,
  state: () => state,
  subGroupFilterDialog: () => subGroupFilterDialog,
  subGroupPickerTrigger: () => subGroupPickerTrigger,
  subGroupSelector: () => subGroupSelector,
  syncVersionRange: () => {
    syncVersionRangeCalls += 1;
  },
  translate: (_key: string, fallback: string) => fallback,
  unicodeGroupLabelKeys: {
    "Smileys & Emotion": "smileysLabel",
  },
  unicodeSubgroupLabelKeys: {
    "face-smiling": "faceSmilingLabel",
  },
});

assert.equal(
  controller.subGroupSelectionKey("Objects", "computer"),
  "Objects::computer",
);
assert.equal(
  controller.displayGroupName("Smileys & Emotion"),
  "Localized Smileys",
);
assert.equal(controller.displayGroupName("Objects"), "Objects");
assert.equal(
  controller.displayUnicodeSubGroupName("face-smiling"),
  "Localized Smiling Faces",
);
assert.equal(
  controller.displayUnicodeSubGroupName("book-paper"),
  "Books & Paper",
);

controller.buildRepresentatives();
assert.equal(controller.getGroupRepresentativeEmoji("Smileys & Emotion"), "😇");
assert.equal(
  controller.getSubGroupRepresentativeEmoji(
    "Smileys & Emotion",
    "face-smiling",
  ),
  "😀",
);
assert.equal(controller.getGroupRepresentativeEmoji("Missing"), "");

controller.renderCategoryFilters();
assert.deepEqual(state.availableGroups, ["Smileys & Emotion"]);
assert.deepEqual(state.availableSequenceTypes, ["single", "zwj"]);
assert.deepEqual(state.availableSubGroups, {
  "Smileys & Emotion": ["face-smiling"],
});
assert.equal(groupField.hidden, false);
assert.equal(subGroupField.hidden, true);
assert.equal(sequenceField.hidden, true);
assert.equal(groupSelector.options.length, 2);
assert.equal(groupSelector.options[0].textContent, "🌐 All");
assert.equal(groupSelector.options[1].textContent, "😇 Localized Smileys");
assert.equal(compactGroupLabel.textContent, "All");
assert.equal(
  groupPickerTrigger.querySelector(".filter-picker-value")?.textContent,
  "All",
);
assert.equal(compactGroupChoices.querySelectorAll('[role="radio"]').length, 2);
assert.equal(
  compactSequenceChoices.querySelectorAll('[role="radio"]').length,
  3,
);

groupSelector.value = "Smileys & Emotion";
controller.onGroupSelectorChange();
assert.equal(state.selectedGroup, "Smileys & Emotion");
assert.equal(state.selectedSubGroup, "");
assert.equal(drawListCalls.length, 1);
assert.equal(subGroupField.hidden, false);
assert.equal(compactGroupLabel.textContent, "Localized Smileys");

subGroupSelector.value = "Smileys & Emotion::face-smiling";
controller.onSubGroupSelectorChange();
assert.equal(state.selectedSubGroup, "Smileys & Emotion::face-smiling");
assert.equal(drawListCalls.length, 2);
assert.equal(compactSubGroupLabel.textContent, "Localized Smiling Faces");

sequenceTypeSelector.value = "zwj";
controller.onSequenceTypeSelectorChange();
assert.equal(state.selectedSequenceType, "zwj");
assert.equal(drawListCalls.length, 3);

controller.onOrderModeChange({ currentTarget: sequenceButton });
assert.equal(state.orderMode, "unicode");
assert.deepEqual(savePreferenceCalls, []);

developerModeEnabled = true;
controller.onOrderModeChange({ currentTarget: sequenceButton });
assert.equal(state.orderMode, "sequence");
assert.deepEqual(savePreferenceCalls, [["order", "sequence"]]);
assert.equal(sequenceButton.classList.contains("is-active"), true);
assert.equal(sequenceButton.getAttribute("aria-pressed"), "true");
assert.equal(unicodeButton.getAttribute("aria-pressed"), "false");
assert.equal(groupField.hidden, true);
assert.equal(sequenceField.hidden, false);
assert.equal(drawListCalls.length, 4);

const activeGroupChoice =
  compactGroupChoices.querySelectorAll<FakeElement>('[role="radio"]')[1];
activeGroupChoice.focus();
controller.renderCategoryFilters();
assert.equal(documentRef.activeElement?.dataset.value, "Smileys & Emotion");

state.groups = [];
controller.refreshLocalizedLabels();
assert.equal(syncVersionRangeCalls, 0);

state.groups = ["Smileys & Emotion"];
controller.refreshLocalizedLabels();
assert.equal(syncVersionRangeCalls, 1);
assert.equal(drawListCalls.length, 5);

const available = controller.updateAvailableCategories();
assert.equal(available, undefined);
assert.deepEqual(state.availableGroups, ["Smileys & Emotion"]);

if (originalDocument === undefined) {
  delete runtime.document;
} else {
  runtime.document = originalDocument;
}

if (originalWindow === undefined) {
  delete runtime.window;
} else {
  runtime.window = originalWindow;
}
