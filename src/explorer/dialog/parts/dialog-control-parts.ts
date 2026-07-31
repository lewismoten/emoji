type SelectorMap = Record<string, string>;

type SelectorResult<TSelectors extends SelectorMap> = {
  dialog: HTMLDialogElement;
  element: HTMLDialogElement;
} & {
  [K in keyof TSelectors]: HTMLElement;
};

export function createDialogControlParts<TSelectors extends SelectorMap>(
  dialog: HTMLDialogElement,
  selectors: TSelectors,
): SelectorResult<TSelectors> {
  const result = {
    dialog,
    element: dialog,
  } as SelectorResult<TSelectors>;
  for (const [key, selector] of Object.entries(selectors)) {
    const element = dialog.querySelector(selector);
    if (!element) {
      throw new Error(`Dialog selector "${selector}" was not found.`);
    }
    (result as Record<string, unknown>)[key] = element;
  }
  return result;
}

export function appendToDialogPart(
  part: Element | null,
  child: Node | null,
): boolean {
  if (!part || !child) return false;
  part.append(child);
  return true;
}
