import assert from "node:assert/strict";
import {
  createFavoriteButtonControl,
  ensureDialogTitleRow,
  ensureFavoriteButton,
  positionFavoriteButton,
} from "../../../src/explorer/dialog/dialog-title-controls.js";

class FakeClassList {
  names = new Set<string>();

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
  textContent = "";
  title = "";
  type = "";

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase();
  }

  set className(value: string) {
    this.classList.setFromString(value);
  }

  get className() {
    return this.classList.toString();
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
    if (name === "title") this.title = value;
    if (name.startsWith("data-")) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
      this.dataset[key] = value;
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
}

class FakeDocument {
  root = new FakeElement("div");

  createElement(tagName: string) {
    return new FakeElement(tagName);
  }

  querySelector<T = FakeElement>(selector: string) {
    return this.root.querySelector(selector) as T | null;
  }
}

function matchesSelector(element: FakeElement, selector: string) {
  if (selector.includes(" ")) {
    const parts = selector.split(/\s+/);
    const last = parts.pop();
    if (!last || !matchesSelector(element, last)) return false;
    let current = element.parentElement;
    while (current) {
      if (parts.length === 1 && matchesSelector(current, parts[0])) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  if (selector.startsWith(".")) {
    return element.classList.contains(selector.slice(1));
  }
  return element.tagName === selector.toUpperCase();
}

const originalDocument = globalThis.document;
const fakeDocument = new FakeDocument();
(globalThis as any).document = fakeDocument;

const favorite = createFavoriteButtonControl();
assert.equal(favorite.tagName, "BUTTON");
assert.equal(favorite.className, "toggle-favorite");
assert.equal(favorite.type, "button");
assert.equal(favorite.getAttribute("aria-pressed"), "false");
assert.equal(favorite.dataset.favoriteState, "off");
assert.equal(favorite.dataset.i18nAriaLabel, "addFavorite");
assert.equal(favorite.getAttribute("aria-label"), "Add favorite");
assert.equal(favorite.title, "Add favorite");
const favoriteGlyph = favorite.querySelector(".favorite-glyph");
assert.ok(favoriteGlyph);
assert.equal(favoriteGlyph?.textContent, "☆");

const dialogTitle = new FakeElement("div");
const title = new FakeElement("h2");
title.textContent = "Wrapped gift";
dialogTitle.append(title);
const titleRow = ensureDialogTitleRow(dialogTitle as unknown as HTMLElement);
assert.ok(titleRow);
assert.equal(titleRow?.className, "dialog-title-row");
assert.equal(dialogTitle.children[0], titleRow);
assert.equal((titleRow as unknown as FakeElement).children[0], title);
assert.equal(ensureDialogTitleRow(dialogTitle as unknown as HTMLElement), titleRow);
assert.equal(ensureDialogTitleRow(null), null);

const exampleDialog = new FakeElement("dialog");
exampleDialog.className = "example-dialog";
const dialogControls = new FakeElement("div");
dialogControls.className = "dialog-controls";
const form = new FakeElement("form");
dialogControls.append(form);
exampleDialog.append(dialogControls);
fakeDocument.root.append(exampleDialog);

const ensuredFavorite = ensureFavoriteButton(dialogControls as unknown as HTMLElement);
assert.ok(ensuredFavorite);
assert.equal(dialogControls.children[0], ensuredFavorite);
assert.equal(ensuredFavorite?.getAttribute("aria-label"), "Add favorite");
assert.equal(ensuredFavorite?.title, "Add favorite");

const label = new FakeElement("span");
label.className = "toggle-favorite-label";
(ensuredFavorite as unknown as FakeElement).append(label);
(ensuredFavorite as unknown as FakeElement).dataset.i18nAriaLabel = "removeFavorite";
(ensuredFavorite as unknown as FakeElement).setAttribute("aria-label", "Remove favorite");
(ensuredFavorite as unknown as FakeElement).title = "Remove favorite";

const reusedFavorite = ensureFavoriteButton(dialogControls as unknown as HTMLElement);
assert.equal(reusedFavorite, ensuredFavorite);
assert.equal(reusedFavorite?.querySelector(".toggle-favorite-label"), null);
assert.equal(reusedFavorite?.dataset.i18nAriaLabel, "addFavorite");
assert.equal(reusedFavorite?.getAttribute("aria-label"), "Add favorite");
assert.equal(reusedFavorite?.title, "Add favorite");
assert.equal(ensureFavoriteButton(null), null);

const dialogTitleRow = new FakeElement("div");
dialogTitleRow.className = "dialog-title-row";
positionFavoriteButton({
  compact: false,
  dialogControls: dialogControls as unknown as HTMLElement,
  dialogTitleRow: dialogTitleRow as unknown as HTMLElement,
  favoriteButton: ensuredFavorite as unknown as HTMLElement,
});
assert.equal(dialogTitleRow.children[0], ensuredFavorite);

positionFavoriteButton({
  compact: true,
  dialogControls: dialogControls as unknown as HTMLElement,
  dialogTitleRow: dialogTitleRow as unknown as HTMLElement,
  favoriteButton: ensuredFavorite as unknown as HTMLElement,
});
assert.equal(dialogControls.children[0], ensuredFavorite);

positionFavoriteButton({
  compact: true,
  dialogControls: null,
  dialogTitleRow: dialogTitleRow as unknown as HTMLElement,
  favoriteButton: ensuredFavorite as unknown as HTMLElement,
});
positionFavoriteButton({
  compact: true,
  dialogControls: dialogControls as unknown as HTMLElement,
  dialogTitleRow: null,
  favoriteButton: ensuredFavorite as unknown as HTMLElement,
});
positionFavoriteButton({
  compact: true,
  dialogControls: dialogControls as unknown as HTMLElement,
  dialogTitleRow: dialogTitleRow as unknown as HTMLElement,
  favoriteButton: null,
});

(globalThis as any).document = originalDocument;
