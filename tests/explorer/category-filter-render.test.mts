import assert from "node:assert/strict";
import { createCategoryFilterRenderer } from "../../src/explorer/category-filter-render.js";

class FakeClassList {
  classes = new Set<string>();

  add(name: string) {
    this.classes.add(name);
  }

  remove(name: string) {
    this.classes.delete(name);
  }

  toggle(name: string, force?: boolean) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : force;
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
  }

  has(name: string) {
    return this.classes.has(name);
  }
}

class FakeElement {
  tagName: string;
  children: FakeElement[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string | undefined> = {};
  className = "";
  hidden = false;
  disabled = false;
  value = "";
  text = "";
  textContent = "";
  open = false;
  focused = false;
  parent: FakeElement | null = null;
  classSet = new Set<string>();
  classList = new FakeClassList();
  listeners = new Map<string, Array<(event: any) => void>>();

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  append(...children: FakeElement[]) {
    for (const child of children) {
      child.parent = this;
      this.children.push(child);
    }
  }

  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children: FakeElement[]) {
    this.children = [];
    this.append(...children);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "role") this.dataset.role = value;
    if (name === "tabindex") this.dataset.tabindex = value;
    if (name.startsWith("data-")) this.dataset[name.slice(5)] = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ currentTarget: this, target: this, ...event });
    }
  }

  focus() {
    this.focused = true;
  }

  close() {
    this.open = false;
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (selector === ".filter-field" && current.className.includes("filter-field")) {
        return current;
      }
      if (selector === ".compact-group-choices" && current.className.includes("compact-group-choices")) {
        return current;
      }
      if (selector === ".compact-subgroup-choices" && current.className.includes("compact-subgroup-choices")) {
        return current;
      }
      if (selector === ".compact-sequence-choices" && current.className.includes("compact-sequence-choices")) {
        return current;
      }
      if (selector === '[role="radio"]' && current.getAttribute("role") === "radio") {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  querySelector(selector: string) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string) {
    const matches = (element: FakeElement) => {
      if (selector === '[role="radio"]') {
        return element.getAttribute("role") === "radio";
      }
      if (selector === '[aria-checked="true"]') {
        return element.getAttribute("aria-checked") === "true";
      }
      if (selector === ".filter-picker-emoji") {
        return element.className.split(/\s+/).includes("filter-picker-emoji");
      }
      if (selector === ".filter-picker-value") {
        return element.className.split(/\s+/).includes("filter-picker-value");
      }
      return false;
    };
    const results: FakeElement[] = [];
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matches(current)) results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const documentStub: any = {
  documentElement: { dir: "ltr" },
  activeElement: null,
  createElement(tagName: string) {
    return new FakeElement(tagName);
  },
};
const windowStub: any = {
  requestAnimationFrame(handler: () => void) {
    handler();
  },
};

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: windowStub,
});

try {
  let availableCategoryKeys = new Set<string>();
  let availableGroups: string[] = [];
  let availableSubGroups: Record<string, string[]> = {};
  let availableSequenceTypes: string[] = [];
  let selectedGroup = "Missing";
  let selectedSubGroup = "Missing::smile";
  let selectedSequenceType = "missing";

  const groupSelectorField = new FakeElement("div");
  groupSelectorField.className = "filter-field";
  const groupSelector = new FakeElement("select");
  groupSelectorField.append(groupSelector);

  const subGroupSelectorField = new FakeElement("div");
  subGroupSelectorField.className = "filter-field";
  const subGroupSelector = new FakeElement("select");
  subGroupSelectorField.append(subGroupSelector);

  const sequenceSelectorField = new FakeElement("div");
  sequenceSelectorField.className = "filter-field";
  const sequenceSelector = new FakeElement("select");
  sequenceSelectorField.append(sequenceSelector);

  const compactGroupChoices = new FakeElement("div");
  compactGroupChoices.className = "compact-choices compact-group-choices";
  const compactGroupLabel = new FakeElement("span");
  const groupPickerTrigger = new FakeElement("button");
  const groupPickerEmoji = new FakeElement("span");
  groupPickerEmoji.className = "filter-picker-emoji";
  const groupPickerValue = new FakeElement("span");
  groupPickerValue.className = "filter-picker-value";
  groupPickerTrigger.append(groupPickerEmoji, groupPickerValue);

  const compactSubGroupChoices = new FakeElement("div");
  compactSubGroupChoices.className = "compact-choices compact-subgroup-choices";
  const compactSubGroupLabel = new FakeElement("span");
  const subGroupPickerTrigger = new FakeElement("button");
  const subGroupPickerEmoji = new FakeElement("span");
  subGroupPickerEmoji.className = "filter-picker-emoji";
  const subGroupPickerValue = new FakeElement("span");
  subGroupPickerValue.className = "filter-picker-value";
  subGroupPickerTrigger.append(subGroupPickerEmoji, subGroupPickerValue);

  const compactSequenceChoices = new FakeElement("div");
  compactSequenceChoices.className = "compact-choices compact-sequence-choices";
  const compactSequenceLabel = new FakeElement("span");

  const renderer = createCategoryFilterRenderer({
    availableGroups: () => availableGroups,
    availableSequenceTypes: () => availableSequenceTypes,
    availableSubGroups: () => availableSubGroups,
    compactGroupChoices: () => compactGroupChoices,
    compactGroupLabel: () => compactGroupLabel,
    compactSequenceChoices: () => compactSequenceChoices,
    compactSequenceLabel: () => compactSequenceLabel,
    compactSubGroupChoices: () => compactSubGroupChoices,
    compactSubGroupLabel: () => compactSubGroupLabel,
    displayGroupName: (name: string) => `shown:${name}`,
    displayUnicodeSubGroupName: (name: string) => `shown:${name}`,
    drawList: () => {},
    getGroupRepresentativeEmoji: (group: string) =>
      group === "Smileys & Emotion" ? "😀" : "🚗",
    getOrderMode: () => "grouped",
    getSubGroupRepresentativeEmoji: (_group: string, subGroup: string) =>
      subGroup === "face-smiling" ? "🙂" : "🚗",
    getVersionKeys: () => new Set(["smile", "car"]),
    groupFilterDialog: () => undefined,
    groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector as any,
    groups: () => ["Smileys & Emotion", "Travel & Places"],
    items: () => [
      {
        group: "Smileys & Emotion",
        key: "smile",
        sequenceType: "single",
        unicodeSubGroup: "face-smiling",
      },
      {
        group: "Travel & Places",
        key: "car",
        sequenceType: "zwj",
        unicodeSubGroup: "transport-ground",
      },
    ],
    selectedGroup: () => selectedGroup,
    selectedSequenceType: () => selectedSequenceType,
    selectedSubGroup: () => selectedSubGroup,
    sequenceTranslationKeys: { single: "single", zwj: "zwj" },
    sequenceTypeEmoji: { single: "1️⃣", zwj: "🔗" },
    sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
    sequenceTypeOrder: ["single", "zwj"],
    sequenceTypeSelector: () => sequenceSelector as any,
    setAvailableCategoryKeys: (value: Set<string>) => {
      availableCategoryKeys = value;
    },
    setAvailableGroups: (value: string[]) => {
      availableGroups = value;
    },
    setAvailableSequenceTypes: (value: string[]) => {
      availableSequenceTypes = value;
    },
    setAvailableSubGroups: (value: Record<string, string[]>) => {
      availableSubGroups = value;
    },
    setSelectedGroup: (value: string) => {
      selectedGroup = value;
    },
    setSelectedSequenceType: (value: string) => {
      selectedSequenceType = value;
    },
    setSelectedSubGroup: (value: string) => {
      selectedSubGroup = value;
    },
    subGroupFilterDialog: () => undefined,
    subGroupPickerTrigger: () => subGroupPickerTrigger,
    subGroupSelectionKey: (group: string, subGroup: string) => `${group}::${subGroup}`,
    subGroupSelector: () => subGroupSelector as any,
    subGroups: () => ({
      "Smileys & Emotion": ["face-smiling"],
      "Travel & Places": ["transport-ground"],
    }),
    translate: (_key: string, fallback: string) => fallback,
    versionKeys: () => new Map([["15.0", new Set(["smile", "car"])]]) as any,
  });

  renderer.updateAvailableCategories();
  assert.deepEqual([...availableCategoryKeys], ["smile", "car"]);
  assert.deepEqual(availableGroups, ["Smileys & Emotion", "Travel & Places"]);
  assert.deepEqual(availableSubGroups, {
    "Smileys & Emotion": ["face-smiling"],
    "Travel & Places": ["transport-ground"],
  });
  assert.deepEqual(availableSequenceTypes, ["single", "zwj"]);
  assert.equal(selectedGroup, "");
  assert.equal(selectedSequenceType, "");
  assert.equal(selectedSubGroup, "");

  selectedGroup = "Smileys & Emotion";
  selectedSubGroup = "Smileys & Emotion::face-smiling";
  selectedSequenceType = "single";

  renderer.renderCategoryFilters();
  assert.equal(groupSelectorField.classList.has("has-choice-buttons"), true);
  assert.equal(subGroupSelectorField.classList.has("has-choice-buttons"), true);
  assert.equal(sequenceSelectorField.classList.has("has-choice-buttons"), true);
  assert.equal(groupSelectorField.hidden, false);
  assert.equal(subGroupSelectorField.hidden, false);
  assert.equal(sequenceSelectorField.hidden, true);
  assert.equal(groupSelector.value, "Smileys & Emotion");
  assert.equal(subGroupSelector.value, "Smileys & Emotion::face-smiling");
  assert.equal(sequenceSelector.value, "single");
  assert.equal(compactGroupLabel.textContent, "shown:Smileys & Emotion");
  assert.equal(compactSubGroupLabel.textContent, "shown:face-smiling");
  assert.equal(compactSequenceLabel.textContent, "Single");
  assert.equal(groupPickerValue.textContent, "shown:Smileys & Emotion");
  assert.equal(subGroupPickerValue.textContent, "shown:face-smiling");
  assert.equal(compactGroupChoices.children.length, 3);
  assert.equal(compactSubGroupChoices.children.length, 2);
  assert.equal(compactSequenceChoices.children.length, 3);

  const focusedSequenceButton = compactSequenceChoices.children[2] as any;
  focusedSequenceButton.dataset.value = "zwj";
  documentStub.activeElement = focusedSequenceButton;
  selectedSequenceType = "zwj";
  renderer.renderCategoryFilters();
  assert.equal(compactSequenceChoices.children[2].focused, true);

  let sequenceModeAvailableCategoryKeys = new Set<string>();
  let sequenceModeAvailableGroups: string[] = [];
  let sequenceModeAvailableSubGroups: Record<string, string[]> = {};
  let sequenceModeAvailableSequenceTypes: string[] = [];
  const sequenceModeRenderer = createCategoryFilterRenderer({
    availableGroups: () => sequenceModeAvailableGroups,
    availableSequenceTypes: () => sequenceModeAvailableSequenceTypes,
    availableSubGroups: () => sequenceModeAvailableSubGroups,
    compactGroupChoices: () => compactGroupChoices,
    compactGroupLabel: () => compactGroupLabel,
    compactSequenceChoices: () => compactSequenceChoices,
    compactSequenceLabel: () => compactSequenceLabel,
    compactSubGroupChoices: () => compactSubGroupChoices,
    compactSubGroupLabel: () => compactSubGroupLabel,
    displayGroupName: (name: string) => name,
    displayUnicodeSubGroupName: (name: string) => name,
    drawList: () => {},
    getGroupRepresentativeEmoji: () => "😀",
    getOrderMode: () => "sequence",
    getSubGroupRepresentativeEmoji: () => "🙂",
    getVersionKeys: () => new Set(["smile"]),
    groupFilterDialog: () => undefined,
    groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector as any,
    groups: () => ["Smileys & Emotion"],
    items: () => [
      {
        group: "Smileys & Emotion",
        key: "smile",
        sequenceType: "single",
        unicodeSubGroup: "face-smiling",
      },
    ],
    selectedGroup: () => "Smileys & Emotion",
    selectedSequenceType: () => "single",
    selectedSubGroup: () => "Smileys & Emotion::face-smiling",
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeEmoji: { single: "1️⃣" },
    sequenceTypeLabels: { single: "Single" },
    sequenceTypeOrder: ["single"],
    sequenceTypeSelector: () => sequenceSelector as any,
    setAvailableCategoryKeys: (value: Set<string>) => {
      sequenceModeAvailableCategoryKeys = value;
    },
    setAvailableGroups: (value: string[]) => {
      sequenceModeAvailableGroups = value;
    },
    setAvailableSequenceTypes: (value: string[]) => {
      sequenceModeAvailableSequenceTypes = value;
    },
    setAvailableSubGroups: (value: Record<string, string[]>) => {
      sequenceModeAvailableSubGroups = value;
    },
    setSelectedGroup: () => {},
    setSelectedSequenceType: () => {},
    setSelectedSubGroup: () => {},
    subGroupFilterDialog: () => undefined,
    subGroupPickerTrigger: () => subGroupPickerTrigger,
    subGroupSelectionKey: (group: string, subGroup: string) => `${group}::${subGroup}`,
    subGroupSelector: () => subGroupSelector as any,
    subGroups: () => ({ "Smileys & Emotion": ["face-smiling"] }),
    translate: (_key: string, fallback: string) => fallback,
    versionKeys: () => new Map([["15.0", new Set(["smile"])]]) as any,
  });
  documentStub.activeElement = null;
  sequenceModeRenderer.renderCategoryFilters();
  assert.deepEqual([...sequenceModeAvailableCategoryKeys], ["smile"]);
  assert.deepEqual(sequenceModeAvailableSequenceTypes, ["single"]);
  assert.equal(groupSelectorField.hidden, true);
  assert.equal(subGroupSelectorField.hidden, true);
  assert.equal(sequenceSelectorField.hidden, false);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete (globalThis as any).window;
}
