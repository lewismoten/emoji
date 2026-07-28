import assert from "node:assert/strict";
import {
  applyBasicUrlStateToControls,
  applyLoadedUrlStateToControls,
  applyExclusiveCheckboxSelection,
  createFilterControlSetup,
  resetFilterControls,
  stepVersionIndex,
} from "../../src/explorer/filter-controls.js";

class FakeElement {
  tagName: string;
  attributes = new Map<string, string>();
  children: FakeElement[] = [];
  className = "";
  classList = {
    add: (...names: string[]) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      for (const name of names) classes.add(name);
      this.className = [...classes].join(" ");
    },
    remove: (...names: string[]) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      for (const name of names) classes.delete(name);
      this.className = [...classes].join(" ");
    },
    toggle: (name: string, force?: boolean) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      const shouldAdd = force ?? !classes.has(name);
      if (shouldAdd) classes.add(name);
      else classes.delete(name);
      this.className = [...classes].join(" ");
      return shouldAdd;
    },
    contains: (name: string) => this.className.split(/\s+/).includes(name),
  };
  dataset: Record<string, string | undefined> = {};
  hidden = false;
  id = "";
  min = "";
  max = "";
  options: Array<{ value: string }> = [];
  parent: FakeElement | null = null;
  role = "";
  step = "";
  textContent = "";
  type = "";
  value = "";
  private innerHtmlValue = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get childNodes() {
    return this.children;
  }

  get innerHTML() {
    return this.innerHtmlValue;
  }

  set innerHTML(value: string) {
    this.innerHtmlValue = value;
    this.children = [];
    if (!value.includes("select-sequence-type")) return;
    const heading = new FakeElement("div");
    heading.className = "filter-heading";
    const label = new FakeElement("span");
    label.id = "sequence-filter-label";
    label.dataset.i18n = "sequenceType";
    label.textContent = "Sequence type";
    const compactLabel = new FakeElement("span");
    compactLabel.className = "compact-sequence-label";
    heading.append(label, compactLabel);
    const select = new FakeElement("select");
    select.className = "select-sequence-type";
    select.setAttribute("aria-labelledby", "sequence-filter-label");
    const choices = new FakeElement("div");
    choices.className = "compact-choices compact-sequence-choices";
    choices.setAttribute("role", "radiogroup");
    choices.setAttribute("aria-labelledby", "sequence-filter-label");
    this.append(heading, select, choices);
  }

  append(...nodes: FakeElement[]) {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }

  appendChild(node: FakeElement) {
    node.parent = this;
    this.children.push(node);
    return node;
  }

  before(node: FakeElement) {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    node.parent = this.parent;
    this.parent.children.splice(index, 0, node);
  }

  prepend(node: FakeElement) {
    node.parent = this;
    this.children.unshift(node);
  }

  replaceWith(node: FakeElement) {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    node.parent = this.parent;
    this.parent.children.splice(index, 1, node);
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (selector.startsWith(".") && current.className.split(/\s+/).includes(selector.slice(1))) {
        return current;
      }
      if (current.tagName === selector.toUpperCase()) return current;
      current = current.parent;
    }
    return null;
  }

  querySelector(selector: string): FakeElement | null {
    const matcher = (element: FakeElement) => {
      if (selector.startsWith(".")) {
        return element.className.split(/\s+/).includes(selector.slice(1));
      }
      return element.tagName === selector.toUpperCase();
    };
    const stack = [...this.children];
    while (stack.length > 0) {
      const current = stack.shift()!;
      if (matcher(current)) return current;
      stack.unshift(...current.children);
    }
    return null;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "aria-labelledby") this.dataset["attr:aria-labelledby"] = value;
    if (name === "role") this.role = value;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
}

class FakeDocument {
  head = new FakeElement("head");
  body = new FakeElement("body");

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  getElementById(id: string) {
    return this.walk().find((element) => element.id === id) ?? null;
  }

  getElementsByClassName(className: string) {
    return this.walk().filter((element) =>
      element.className.split(/\s+/).includes(className),
    );
  }

  querySelector(selector: string) {
    if (selector === ".filter-grid .version-field") {
      return this.walk().find(
        (element) =>
          element.className.split(/\s+/).includes("version-field") &&
          element.parent?.className.split(/\s+/).includes("filter-grid"),
      ) ?? null;
    }
    return this.body.querySelector(selector);
  }

  private walk() {
    const results: FakeElement[] = [];
    const stack = [this.body, this.head];
    while (stack.length > 0) {
      const current = stack.shift()!;
      results.push(current);
      stack.unshift(...current.children);
    }
    return results;
  }
}

const checkboxes = [
  { checked: false, value: "male" },
  { checked: true, value: "female" },
  { checked: false, value: "neutral" },
];

applyExclusiveCheckboxSelection(checkboxes, checkboxes[1]);
assert.deepEqual(
  checkboxes.map((checkbox) => checkbox.checked),
  [false, true, false],
);

checkboxes[2].checked = true;
applyExclusiveCheckboxSelection(checkboxes, checkboxes[2]);
assert.deepEqual(
  checkboxes.map((checkbox) => checkbox.checked),
  [false, false, true],
);

checkboxes[2].checked = false;
applyExclusiveCheckboxSelection(checkboxes, checkboxes[2]);
assert.deepEqual(
  checkboxes.map((checkbox) => checkbox.checked),
  [false, false, false],
);

assert.equal(stepVersionIndex(3, 10, 2), 5);
assert.equal(stepVersionIndex(3, 10, -5), 0);
assert.equal(stepVersionIndex(8, 10, 4), 9);

const orderButtons = [
  {
    dataset: { order: "unicode" } as Record<string, string | undefined>,
    active: false,
    classList: {
      toggle(_name: string, force?: boolean) {
        orderButtons[0].active = Boolean(force);
      },
    },
    setAttribute(name: string, value: string) {
      this.dataset[`attr:${name}`] = value;
    },
  },
  {
    dataset: { order: "sequence" } as Record<string, string | undefined>,
    active: false,
    classList: {
      toggle(_name: string, force?: boolean) {
        orderButtons[1].active = Boolean(force);
      },
    },
    setAttribute(name: string, value: string) {
      this.dataset[`attr:${name}`] = value;
    },
  },
];
const searchText = { value: "" };
const basicStateResult = applyBasicUrlStateToControls({
  state: {
    compositionMode: "condensed",
    order: "sequence",
    search: "gift",
    sequenceType: "zwj",
  } as any,
  searchText,
  orderButtons: orderButtons as any,
});
assert.equal(searchText.value, "gift");
assert.equal(orderButtons[0].active, false);
assert.equal(orderButtons[1].active, true);
assert.equal(orderButtons[1].dataset["attr:aria-pressed"], "true");
assert.deepEqual(basicStateResult, {
  compositionMode: "condensed",
  orderMode: "sequence",
  selectedSequenceType: "zwj",
});

const versionSelector = {
  value: "",
  options: [{ value: "16.0" }, { value: "17.0" }],
};
const versionModeSelector = { value: "" };
const skinBoxes = [
  { checked: false, value: "1F3FB" },
  { checked: false, value: "1F3FE" },
];
const hairBoxes = [
  { checked: false, value: "1F9B0" },
  { checked: false, value: "1F9B2" },
];
const genderBoxes = [
  { checked: false, value: "male" },
  { checked: false, value: "female" },
  { checked: false, value: "neutral" },
];
const loadedStateResult = applyLoadedUrlStateToControls({
  state: {
    version: "17.0",
    versionMode: "selected",
    group: "Objects",
    subGroup: "mail",
    skin: ["1F3FE"],
    hair: ["1F9B0"],
    gender: ["neutral", "female"],
  } as any,
  versionSelector: versionSelector as any,
  versionModeSelector: versionModeSelector as any,
  groups: ["Objects", "Flags"],
  subGroups: { Objects: ["mail", "computer"] },
  skinToneCheckboxes: skinBoxes as any,
  hairCheckboxes: hairBoxes as any,
  genderCheckboxes: genderBoxes as any,
  subGroupSelectionKey: (group: string, subGroup: string) =>
    `${group}:${subGroup}`,
});
assert.equal(versionSelector.value, "17.0");
assert.equal(versionModeSelector.value, "selected");
assert.deepEqual(
  skinBoxes.map((box) => box.checked),
  [false, true],
);
assert.deepEqual(
  hairBoxes.map((box) => box.checked),
  [true, false],
);
assert.deepEqual(
  genderBoxes.map((box) => box.checked),
  [false, false, true],
);
assert.deepEqual(loadedStateResult, {
  selectedGroup: "Objects",
  selectedSubGroup: "Objects:mail",
});

resetFilterControls({
  searchText,
  versionModeSelector: versionModeSelector as any,
  versionSelector: versionSelector as any,
  latestReleasedVersion: "16.0",
  skinToneCheckboxes: skinBoxes as any,
  hairCheckboxes: hairBoxes as any,
  genderCheckboxes: genderBoxes as any,
});
assert.equal(searchText.value, "");
assert.equal(versionModeSelector.value, "through");
assert.equal(versionSelector.value, "16.0");
assert.equal(skinBoxes.every((box) => !box.checked), true);
assert.equal(hairBoxes.every((box) => !box.checked), true);
assert.equal(genderBoxes.every((box) => !box.checked), true);

const fakeDocument = new FakeDocument();
const originalDocument = (globalThis as typeof globalThis & { document?: any })
  .document;
(globalThis as typeof globalThis & { document: any }).document = fakeDocument;

const filterOptions = fakeDocument.createElement("div");
filterOptions.className = "filter-options";
const filterGrid = fakeDocument.createElement("div");
filterGrid.className = "filter-grid";
fakeDocument.body.append(filterOptions, filterGrid);

const groupField = fakeDocument.createElement("label");
groupField.className = "filter-field";
const groupLabel = fakeDocument.createElement("span");
groupLabel.textContent = "Group";
const groupSelector = fakeDocument.createElement("select");
groupField.append(groupLabel, groupSelector);
filterGrid.append(groupField);

const versionField = fakeDocument.createElement("label");
versionField.className = "filter-field version-field";
const versionLabel = fakeDocument.createElement("span");
versionLabel.textContent = "Version";
const versionSelectElement = fakeDocument.createElement("select");
const modeField = fakeDocument.createElement("div");
modeField.className = "filter-field";
const modeSelectElement = fakeDocument.createElement("select");
versionField.append(versionLabel, versionSelectElement);
modeField.append(modeSelectElement);
filterGrid.append(versionField, modeField);

const setup = createFilterControlSetup({
  document: fakeDocument as any,
  versionModeSelector: modeSelectElement as any,
  versionRange: () => setup.ensureVersionSlider().range,
  versionSelector: versionSelectElement as any,
});

const summaryParts = setup.ensureActiveFilterSummary();
assert.equal(summaryParts.summary.className, "active-filter-summary");
assert.equal(summaryParts.summary.hidden, true);
assert.equal(summaryParts.text?.className, "active-filter-text");
assert.equal(summaryParts.clear?.className, "clear-filters");

const choices = setup.ensureChoiceContainer(
  groupSelector as any,
  "compact-group-choices",
  "group-filter-label",
);
assert.equal(choices.className, "compact-choices compact-group-choices");
assert.equal(choices.role, "radiogroup");
assert.equal(groupSelector.dataset["attr:aria-labelledby"], "group-filter-label");
assert.equal(groupField.tagName, "LABEL");
assert.equal(
  filterGrid.children[0]?.tagName,
  "DIV",
);

const selectionLabel = setup.ensureSelectionLabel(
  groupSelector as any,
  "compact-group-label",
  "group-filter-label",
);
assert.equal(selectionLabel?.className, "compact-group-label");
assert.equal(
  filterGrid.children[0]?.querySelector(".filter-heading")?.className,
  "filter-heading",
);

const sequenceFilter = setup.ensureSequenceTypeFilter();
assert.equal(sequenceFilter?.className, "select-sequence-type");
assert.equal(filterGrid.children[1]?.className, "filter-field sequence-filter-field");

const slider = setup.ensureVersionSlider();
assert.equal(slider.range.className, "version-range");
assert.equal(slider.range.type, "range");
assert.equal(slider.output.className, "version-range-value");

const versionModeButton = setup.ensureVersionModeToggle();
assert.equal(versionModeButton.className, "version-mode-toggle");
assert.equal(modeField.hidden, true);
assert.equal(modeSelectElement.hidden, true);

if (originalDocument === undefined) {
  delete (globalThis as typeof globalThis & { document?: any }).document;
} else {
  (globalThis as typeof globalThis & { document: any }).document =
    originalDocument;
}
