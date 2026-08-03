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

const ATTRIBUTE = "data-dialog-observer";

const createObserver = () =>
  new MutationObserver((records) => {
    records.forEach((record) => {
      if (!(record.target instanceof HTMLDialogElement)) return;
      const dialog = record.target;
      if (!dialog.matches(".dialog")) return;
      listeners.forEach((fn) => fn(actionType(dialog), dialog));
    });
  });

const isObserverRegistered = (body: HTMLBodyElement) =>
  body.hasAttribute(ATTRIBUTE) && body.getAttribute(ATTRIBUTE) !== "true";

const registerObserver = (body: HTMLBodyElement) => {
  observer ??= createObserver();
  body.setAttribute(ATTRIBUTE, "true");
  observer.observe(body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });
};
const unregisterObserver = (body: HTMLBodyElement) => {
  body.removeAttribute(ATTRIBUTE);
  observer?.disconnect();
};
const setupObserver = () => {
  if (typeof MutationObserver === "undefined") return;
  const body = documentRef()?.body as HTMLBodyElement | undefined;
  if (!body) return;
  if (isObserverRegistered(body)) {
    if (listeners.size === 0) unregisterObserver(body);
    return;
  }
  if (listeners.size > 0) {
    registerObserver(body);
  }
};
