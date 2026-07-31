import assert from "node:assert/strict";
import {
  removeLegacyDialogElements,
  upgradeEmojiDialog,
} from "../../../src/explorer/dialog/dialog-upgrade.js";

class FakeClassList {
  names = new Set<string>();

  add(...names: string[]) {
    names.forEach((name) => this.names.add(name));
  }

  remove(...names: string[]) {
    names.forEach((name) => this.names.delete(name));
  }

  contains(name: string) {
    return this.names.has(name);
  }

  setFromString(value: string) {
    this.names = new Set(value.split(/\s+/).filter(Boolean));
  }

  toString() {
    return [...this.names].join(" ");
  }
}

class FakeElement {
  tagName: string;
  parentElement: FakeElement | null = null;
  children: Array<FakeElement | string> = [];
  classList = new FakeClassList();
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  hidden = false;
  textContent = "";
  innerHtmlValue = "";
  type = "";
  id = "";
  rel = "";
  href = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  set className(value: string) {
    this.classList.setFromString(value);
  }

  get className() {
    return this.classList.toString();
  }

  set innerHTML(value: string) {
    this.innerHtmlValue = value;
  }

  get innerHTML() {
    return this.innerHtmlValue;
  }

  append(...nodes: Array<FakeElement | string>) {
    nodes.forEach((node) => this.appendChild(node));
  }

  appendChild(node: FakeElement | string) {
    this.children.push(node);
    if (node instanceof FakeElement) node.parentElement = this;
    return node;
  }

  prepend(...nodes: Array<FakeElement | string>) {
    const next = nodes.map((node) => {
      if (node instanceof FakeElement) node.parentElement = this;
      return node;
    });
    this.children = [...next, ...this.children];
  }

  after(...nodes: Array<FakeElement | string>) {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    const index = siblings.indexOf(this);
    const next = nodes.map((node) => {
      if (node instanceof FakeElement) node.parentElement = this.parentElement;
      return node;
    });
    siblings.splice(index + 1, 0, ...next);
  }

  before(...nodes: Array<FakeElement | string>) {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    const index = siblings.indexOf(this);
    const next = nodes.map((node) => {
      if (node instanceof FakeElement) node.parentElement = this.parentElement;
      return node;
    });
    siblings.splice(index, 0, ...next);
  }

  replaceWith(node: FakeElement | string) {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    const index = siblings.indexOf(this);
    if (index === -1) return;
    if (node instanceof FakeElement) node.parentElement = this.parentElement;
    siblings.splice(index, 1, node);
    this.parentElement = null;
  }

  replaceChildren(...nodes: Array<FakeElement | string>) {
    this.children = [];
    this.append(...nodes);
  }

  remove() {
    if (!this.parentElement) return;
    const siblings = this.parentElement.children;
    const index = siblings.indexOf(this);
    if (index !== -1) siblings.splice(index, 1);
    this.parentElement = null;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
    if (name === "class") this.className = value;
    if (name === "type") this.type = value;
    if (name === "id") this.id = value;
    if (name === "rel") this.rel = value;
    if (name === "href") this.href = value;
    if (name === "hidden") this.hidden = true;
    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
      this.dataset[key] = value;
    }
  }

  removeAttribute(name: string) {
    this.attributes.delete(name);
    if (name === "hidden") this.hidden = false;
    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
      delete this.dataset[key];
    }
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  querySelector<T = FakeElement>(selector: string) {
    return (this.querySelectorAll(selector)[0] ?? null) as T | null;
  }

  querySelectorAll<T = FakeElement>(selector: string) {
    const selectors = selector.split(",").map((value) => value.trim());
    const matches: FakeElement[] = [];
    const visit = (node: FakeElement | string) => {
      if (!(node instanceof FakeElement)) return;
      if (selectors.some((part) => matchesSelector(node, part))) {
        matches.push(node);
      }
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return matches as T[];
  }

  closest(selector: string) {
    let current: FakeElement | null = this;
    while (current) {
      if (matchesSelector(current, selector)) return current;
      current = current.parentElement;
    }
    return null;
  }
}

class FakeDocument {
  head = {
    appendChild() {},
  };
  exampleDialog: FakeElement | null = null;

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  getElementById() {
    return null;
  }

  querySelector(selector: string) {
    if (selector === ".example-dialog") return this.exampleDialog;
    return this.exampleDialog?.querySelector(selector) ?? null;
  }
}

function matchesSimpleSelector(
  element: FakeElement,
  selector: string,
): boolean {
  if (selector === "div") return element.tagName === "DIV";
  if (selector.startsWith(".")) {
    return element.classList.contains(selector.slice(1));
  }
  const notMatch = selector.match(/^(.*):not\((\.[^)]+)\)$/);
  if (notMatch) {
    return (
      matchesSimpleSelector(element, notMatch[1]) &&
      !matchesSimpleSelector(element, notMatch[2])
    );
  }
  const dataMatch = selector.match(/^\[data-([^=]+)="([^"]+)"\]$/);
  if (dataMatch) {
    const key = dataMatch[1].replace(/-([a-z])/g, (_match, letter: string) =>
      letter.toUpperCase(),
    );
    return element.dataset[key] === dataMatch[2];
  }
  const dataPresenceMatch = selector.match(/^\[data-([^\]]+)\]$/);
  if (dataPresenceMatch) {
    const key = dataPresenceMatch[1].replace(
      /-([a-z])/g,
      (_match, letter: string) => letter.toUpperCase(),
    );
    return key in element.dataset;
  }
  return false;
}

function matchesSelector(element: FakeElement, selector: string): boolean {
  if (selector.includes(":has(")) return false;
  if (selector.includes(" ")) {
    const parts = selector.split(/\s+/);
    const last = parts.pop();
    if (!last || !matchesSimpleSelector(element, last)) return false;
    let current = element.parentElement;
    while (current) {
      if (parts.length === 1 && matchesSimpleSelector(current, parts[0])) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  return matchesSimpleSelector(element, selector);
}

const originalDocument = globalThis.document;
const fakeDocument = new FakeDocument();
(globalThis as any).document = fakeDocument;

const exampleDialog = new FakeElement("dialog");
exampleDialog.className = "example-dialog";
fakeDocument.exampleDialog = exampleDialog;

const dialogHeading = new FakeElement("div");
dialogHeading.className = "dialog-heading";
const dialogControls = new FakeElement("div");
dialogControls.className = "dialog-controls";
const eyebrow = new FakeElement("div");
eyebrow.className = "emoji-dialog-eyebrow";
const details = new FakeElement("section");
details.className = "emoji-dialog-details";
const metadata = new FakeElement("div");
metadata.className = "emoji-metadata";
const metadataRow = new FakeElement("div");
const metadataLabel = new FakeElement("span");
metadataLabel.dataset.i18n = "codePoints";
metadataRow.append(metadataLabel);
metadata.append(metadataRow);
const legacyCodePoints = new FakeElement("div");
legacyCodePoints.className = "emoji-code-points";
const legacyCodePointsRow = new FakeElement("div");
legacyCodePointsRow.append(legacyCodePoints);
const preview = new FakeElement("div");
preview.className = "emoji-preview";
preview.textContent = "🎁";
const copyActions = new FakeElement("div");
copyActions.className = "emoji-copy-actions";
const keyCopy = new FakeElement("button");
keyCopy.dataset.copy = "key";
keyCopy.textContent = "Copy key";
const escapeCopy = new FakeElement("button");
escapeCopy.dataset.copy = "escape";
const existingLong = new FakeElement("span");
existingLong.className = "copy-action-long";
existingLong.textContent = "Keep existing";
escapeCopy.append(existingLong);
const emojiCopy = new FakeElement("button");
emojiCopy.dataset.copy = "emoji";
emojiCopy.textContent = "Copy emoji";
const unknownCopy = new FakeElement("button");
unknownCopy.dataset.copy = "mystery";
unknownCopy.textContent = "Mystery";
copyActions.append(keyCopy, escapeCopy, emojiCopy, unknownCopy);
const legacyCopiedDescription = new FakeElement("p");
legacyCopiedDescription.dataset.i18n = "copiedDescription";
const exampleLink = new FakeElement("a");
exampleLink.className = "example-link";
const code = new FakeElement("pre");
code.className = "code";

exampleDialog.append(
  dialogHeading,
  dialogControls,
  eyebrow,
  details,
  metadata,
  legacyCodePointsRow,
  preview,
  copyActions,
  legacyCopiedDescription,
  exampleLink,
  code,
);

const ensureImportExamplesCalls: FakeElement[] = [];
upgradeEmojiDialog({
  ensureImportExamples: (dialog) => {
    ensureImportExamplesCalls.push(dialog as unknown as FakeElement);
  },
  exampleDialog: exampleDialog as unknown as HTMLElement,
  translate: (key, fallback) =>
    key === "emojiDetails" ? "--image know" : fallback,
});

assert.deepEqual(ensureImportExamplesCalls, [exampleDialog]);
assert.equal(exampleDialog.querySelector('[data-i18n="copiedDescription"]'), null);
assert.equal(exampleDialog.querySelector(".example-link"), null);
assert.equal(
  exampleDialog.querySelector('.emoji-copy-actions [data-copy="emoji"]'),
  null,
);
assert.equal(exampleDialog.querySelector(".emoji-code-points"), null);
assert.equal(
  exampleDialog.querySelector('.emoji-metadata [data-i18n="codePoints"]'),
  null,
);

const parentButton = dialogControls.querySelector(".emoji-parent");
assert.ok(parentButton);
assert.equal(parentButton?.hidden, true);
assert.equal(parentButton?.textContent, "↩");

assert.equal(eyebrow.dataset.i18n, "emojiDetails");
assert.equal(eyebrow.textContent, "--image know");

const upgradedPreview = exampleDialog.querySelector(".emoji-preview");
assert.equal(upgradedPreview?.tagName, "BUTTON");
assert.equal(upgradedPreview?.dataset.copy, "emoji");
assert.equal(upgradedPreview?.dataset.i18nAriaLabel, "copyEmoji");
assert.equal(upgradedPreview?.getAttribute("aria-label"), "Copy emoji");
assert.ok(upgradedPreview?.querySelector(".emoji-preview-glyph"));
assert.ok(upgradedPreview?.querySelector(".emoji-preview-copy-label"));

const renderingDiagnostic = exampleDialog.querySelector(".rendering-diagnostic");
assert.ok(renderingDiagnostic);
assert.equal(renderingDiagnostic?.hidden, true);
assert.equal(
  renderingDiagnostic?.getAttribute("aria-labelledby"),
  "rendering-diagnostic-title",
);
assert.match(renderingDiagnostic?.innerHTML ?? "", /system-render-glyph/);

const invitation = exampleDialog.querySelector(".pixel-design-invitation");
assert.ok(invitation);
assert.equal(invitation?.hidden, true);
assert.match(invitation?.innerHTML ?? "", /show-pixel-editor/);

const codeView = exampleDialog.querySelector(".emoji-code-view");
assert.ok(codeView);
assert.equal(codeView?.hidden, true);
assert.equal(codeView?.querySelector(".code"), code);

const toolbar = exampleDialog.querySelector(".emoji-code-toolbar");
assert.ok(toolbar);
const codeCopyButton = toolbar?.querySelector('[data-copy="code"]');
const linkCopyButton = toolbar?.querySelector('[data-copy="link"]');
assert.equal(codeCopyButton?.className, "emoji-code-copy");
assert.equal(linkCopyButton?.className, "emoji-code-link");
assert.match(codeCopyButton?.innerHTML ?? "", /copy-action-long/);
assert.match(linkCopyButton?.innerHTML ?? "", /🔗/);

const showCode = copyActions.querySelector(".show-emoji-code");
const showEditor = copyActions.querySelector(".show-pixel-editor");
const actionLink = copyActions.querySelector('[data-copy="link"]');
assert.ok(showCode);
assert.ok(showEditor);
assert.ok(actionLink);
assert.equal(escapeCopy.querySelector(".copy-action-long"), existingLong);
assert.equal(escapeCopy.getAttribute("aria-label"), "Copy escape");
assert.equal(escapeCopy.dataset.i18nAriaLabel, "copyEscape");
assert.equal(unknownCopy.children.length, 0);
assert.equal(unknownCopy.getAttribute("aria-label"), null);

const copyStatus = exampleDialog.querySelector(".copy-status");
assert.ok(copyStatus);
assert.equal(copyStatus?.getAttribute("role"), "status");
assert.equal(copyStatus?.getAttribute("aria-live"), "polite");

const parentCountBefore = dialogControls.querySelectorAll(".emoji-parent").length;
upgradeEmojiDialog({
  ensureImportExamples: () => {},
  exampleDialog: exampleDialog as unknown as HTMLElement,
  translate: (key, fallback) =>
    key === "emojiDetails" ? "--image know" : fallback,
});
assert.equal(dialogControls.querySelectorAll(".emoji-parent").length, parentCountBefore);

const legacyDialog = new FakeElement("dialog");
legacyDialog.className = "example-dialog";
const legacyDescription = new FakeElement("p");
legacyDescription.dataset.i18n = "copiedDescription";
legacyDialog.append(legacyDescription);
fakeDocument.exampleDialog = legacyDialog;
removeLegacyDialogElements();
assert.equal(legacyDialog.querySelector('[data-i18n="copiedDescription"]'), null);

(globalThis as any).document = originalDocument;
