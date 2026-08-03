import documentRef from "../../utils/document.js";

type DialogEventListener = (
  action: "open" | "close",
  dialog: HTMLDialogElement,
) => void;

const listeners = new Set<DialogEventListener>();

export const add = (fn: DialogEventListener) => {
  let adding = !listeners.has(fn);
  if (adding) listeners.add(fn);
  setupObserver();
  return adding;
};

export const remove = (fn: DialogEventListener) => {
  const removed = listeners.delete(fn);
  setupObserver();
  return removed;
};

export const clear = () => {
  listeners.clear();
  setupObserver();
};

const actionType = (dialog: HTMLDialogElement) =>
  dialog.open ? "open" : "close";

let observer: MutationObserver | undefined;

const getObserver = () => {
  if (observer) return observer;
  if (typeof MutationObserver === "undefined") return undefined;
  observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (!(record.target instanceof HTMLDialogElement)) return;
      const dialog = record.target;
      if (!dialog.matches(".dialog")) return;
      listeners.forEach((fn) => fn(actionType(dialog), dialog));
    });
  });
  return observer;
};

const ATTRIBUTE = "data-dialog-observer";

const isObserverRegistered = (doc: Document | undefined) => {
  if (!hasBody(doc)) return false;
  return !canRegister(doc);
};
const canRegister = (doc: Document | undefined) => {
  if (!hasBody(doc)) return false;
  if (
    doc.body.hasAttribute(ATTRIBUTE) &&
    doc.body.getAttribute(ATTRIBUTE) !== "true"
  )
    return false;
  return true;
};
const hasBody = (
  doc: Document | undefined,
): doc is Document & { body: HTMLBodyElement } => {
  if (!doc) return false;
  if (!doc.body) return false;
  return true;
};
const registerObserver = (doc: Document) => {
  const activeObserver = getObserver();
  if (!activeObserver) return;
  doc.body.setAttribute(ATTRIBUTE, "true");
  activeObserver.observe(doc.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });
};
const unregisterObserver = (doc: Document) => {
  doc.body.removeAttribute(ATTRIBUTE);
  observer?.disconnect();
};
const setupObserver = () => {
  if (typeof MutationObserver === "undefined") return;
  const doc = documentRef();
  if (!hasBody(doc)) return;
  if (isObserverRegistered(doc)) {
    if (listeners.size === 0) unregisterObserver(doc);
    return;
  }
  if (listeners.size > 0) {
    registerObserver(doc);
  }
};
