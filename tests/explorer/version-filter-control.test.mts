import assert from "node:assert/strict";
import {
  ensureSequenceTypeFilterField,
  ensureVersionModeToggleControl,
  ensureVersionSliderControl,
} from "../../src/explorer/version-filter-control.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

class FakeClassList {
  values = new Set<string>();
  add(name: string) {
    this.values.add(name);
  }
}

class FakeElement {
  tagName: string;
  className = "";
  hidden = false;
  private _innerHTML = "";
  id = "";
  type = "";
  min = "";
  max = "";
  step = "";
  value = "";
  disabled = false;
  childNodes: unknown[] = [];
  children: FakeElement[] = [];
  classList = new FakeClassList();
  attributes = new Map<string, string>();
  parent: FakeElement | null = null;
  nodes = new Map<string, FakeElement>();
  dataset: Record<string, string | undefined> = {};

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  get innerHTML() {
    return this._innerHTML;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "id") this.id = value;
    if (name === "min") this.min = value;
    if (name === "max") this.max = value;
    if (name === "step") this.step = value;
    if (name === "value") this.value = value;
    if (name === "disabled") this.disabled = true;
  }

  append(...nodes: FakeElement[]) {
    nodes.forEach((node) => {
      node.parent = this;
      this.children.push(node);
      this.nodes.set(node.tagName.toLowerCase(), node);
      this.register(node);
    });
  }

  appendChild(node: FakeElement) {
    node.parent = this;
    this.children.push(node);
    this.nodes.set(node.tagName.toLowerCase(), node);
    this.register(node);
  }

  prepend(node: FakeElement) {
    node.parent = this;
    this.children.unshift(node);
    this.nodes.set(node.tagName.toLowerCase(), node);
    this.register(node);
  }

  before(node: FakeElement) {
    this.nodes.set("before", node);
    node.parent = this.parent;
  }

  replaceWith(node: FakeElement) {
    this.nodes.set("replacement", node);
    node.parent = this.parent;
  }

  querySelector(selector: string) {
    return this.nodes.get(selector) ?? null;
  }

  closest(selector: string) {
    return selector === ".filter-field" ? this.parent : null;
  }

  private register(node: FakeElement) {
    if (node.className) {
      node.className
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => this.nodes.set(`.${name}`, node));
    }
    if (node.id) this.nodes.set(`#${node.id}`, node);
    node.children.forEach((child) => this.register(child));
  }
}

try {
  const sequenceContainer = new FakeElement("div");
  const versionField = new FakeElement("div");
  versionField.className = "filter-field version-field";
  const grid = new FakeElement("div");
  grid.nodes.set(".filter-grid .version-field", versionField);

  const doc1 = {
    getElementsByClassName(name: string) {
      return name === "select-sequence-type" ? [] : [];
    },
    createElement(tag: string) {
      return new FakeElement(tag);
    },
    querySelector(selector: string) {
      return grid.querySelector(selector);
    },
  };
  const createdField = ensureSequenceTypeFilterField(doc1 as any) as FakeElement;
  assert.equal(versionField.nodes.get("before") instanceof FakeElement, true);
  assert.equal(createdField.tagName, "SELECT");

  const existingSequence = new FakeElement("select");
  const doc2 = {
    getElementsByClassName(name: string) {
      return name === "select-sequence-type" ? [existingSequence] : [];
    },
  };
  assert.equal(ensureSequenceTypeFilterField(doc2 as any), existingSequence);

  const label = new FakeElement("span");
  const wrapperField = new FakeElement("label");
  wrapperField.className = "filter-field";
  wrapperField.childNodes = [label];
  wrapperField.nodes.set("span", label);
  const selector = new FakeElement("select");
  selector.parent = wrapperField;
  selector.closest = (query: string) =>
    query === ".filter-field" ? wrapperField : null;

  const doc3 = {
    getElementsByClassName(name: string) {
      if (name === "version-range") return [];
      if (name === "version-range-value") return [];
      return [];
    },
    createElement(tag: string) {
      return new FakeElement(tag);
    },
  };
  const slider = ensureVersionSliderControl({
    document: doc3 as any,
    versionSelector: selector as any,
  });
  assert.equal(wrapperField.nodes.get("replacement") instanceof FakeElement, true);
  const replacement = wrapperField.nodes.get("replacement") as FakeElement;
  assert.equal(replacement.className, "filter-field version-field");
  assert.equal(label.id, "version-filter-label");
  assert.equal(selector.attributes.get("aria-labelledby"), "version-filter-label");
  assert.equal(slider.range.id, "version-range");
  assert.equal(slider.range.className, "version-range");
  assert.equal(slider.output.id, "version-range-value");
  assert.equal(slider.output.value, "—");

  const existingRange = new FakeElement("input");
  const existingOutput = new FakeElement("output");
  const existingField = new FakeElement("div");
  existingField.classList = new FakeClassList();
  existingRange.parent = existingField;
  existingRange.closest = (query: string) =>
    query === ".version-field" ? existingField : null;
  const doc4 = {
    getElementsByClassName(name: string) {
      if (name === "version-range") return [existingRange];
      if (name === "version-range-value") return [existingOutput];
      return [];
    },
  };
  const reused = ensureVersionSliderControl({
    document: doc4 as any,
    versionSelector: selector as any,
  });
  assert.equal(reused.range, existingRange);
  assert.equal(reused.output, existingOutput);
  assert.equal(existingField.classList.values.has("developer-only"), true);

  const oldModeField = new FakeElement("div");
  const versionSelectorField = new FakeElement("div");
  const versionModeSelector = new FakeElement("select");
  versionModeSelector.parent = oldModeField;
  versionModeSelector.closest = (query: string) =>
    query === ".filter-field" ? oldModeField : null;
  const versionSelector2 = new FakeElement("select");
  versionSelector2.parent = versionSelectorField;
  versionSelector2.closest = (query: string) =>
    query === ".filter-field" ? versionSelectorField : null;
  const compactVersion = new FakeElement("div");
  compactVersion.className = "compact-version";
  const versionRangeHost = new FakeElement("input");
  versionRangeHost.parent = compactVersion;
  versionRangeHost.closest = (query: string) =>
    query === ".compact-version" ? compactVersion : null;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      head: new FakeElement("head"),
      createElement(tag: string) {
        return new FakeElement(tag);
      },
      getElementById() {
        return null;
      },
      getElementsByClassName(name: string) {
        if (name === "version-mode-toggle") return [];
        return [];
      },
    },
  });
  const createdToggle = ensureVersionModeToggleControl({
    document: globalThis.document,
    versionModeSelector: versionModeSelector as any,
    versionRange: () => versionRangeHost,
    versionSelector: versionSelector2 as any,
  }) as FakeElement;
  assert.equal(oldModeField.hidden, true);
  assert.equal(versionModeSelector.hidden, true);
  assert.equal(compactVersion.children[0], createdToggle);

  const sharedField = new FakeElement("div");
  const inlineModeSelector = new FakeElement("select");
  inlineModeSelector.parent = sharedField;
  inlineModeSelector.closest = (query: string) =>
    query === ".filter-field" ? sharedField : null;
  const inlineVersionSelector = new FakeElement("select");
  inlineVersionSelector.parent = sharedField;
  inlineVersionSelector.closest = (query: string) =>
    query === ".filter-field" ? sharedField : null;
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      head: new FakeElement("head"),
      createElement(tag: string) {
        return new FakeElement(tag);
      },
      getElementById() {
        return null;
      },
      getElementsByClassName() {
        return [];
      },
    },
  });
  const inlineToggle = ensureVersionModeToggleControl({
    document: globalThis.document,
    versionModeSelector: inlineModeSelector as any,
    versionRange: () => undefined,
    versionSelector: inlineVersionSelector as any,
  });
  assert.equal(sharedField.hidden, false);
  assert.equal(inlineModeSelector.hidden, true);
  assert.equal(inlineToggle.className, "version-mode-toggle");

  const existingToggle = new FakeElement("button");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      head: new FakeElement("head"),
      createElement(tag: string) {
        return new FakeElement(tag);
      },
      getElementById() {
        return null;
      },
      getElementsByClassName(name: string) {
        if (name === "version-mode-toggle") return [existingToggle];
        return [];
      },
    },
  });
  assert.equal(
    ensureVersionModeToggleControl({
      document: globalThis.document,
      versionModeSelector: versionModeSelector as any,
      versionRange: () => versionRangeHost,
      versionSelector: versionSelector2 as any,
    }),
    existingToggle,
  );
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
