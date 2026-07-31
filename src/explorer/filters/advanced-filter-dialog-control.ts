import { AdvancedFiltersTriggerControl } from "../../controls/filters/pickers/advanced-filters-trigger.js";

export function createAdvancedFiltersTriggerControl() {
  return AdvancedFiltersTriggerControl.create();
}

export async function createAdvancedFiltersDialogControl() {
  const { AdvancedFiltersDialogControl } = await import(
    "../../controls/dialog/content/advanced-filters-dialog.js"
  );
  const dialog = AdvancedFiltersDialogControl.create() as HTMLDialogElement;
  const body = dialog.querySelector(".advanced-filters-dialog-body");
  if (!body) {
    throw new Error("Advanced filters dialog body was not created.");
  }
  const grid = dialog.querySelector(".filter-grid");
  const modifiers = dialog.querySelector(".modifier-filters");
  if (!grid || !modifiers) {
    throw new Error("Advanced filters dialog content was not created.");
  }
  return {
    body,
    dialog,
    grid: grid as HTMLDivElement,
    modifiers: modifiers as HTMLDivElement,
  };
}

export function ensureAdvancedFilterControls() {
  const filterOptions = document.querySelector(".filter-options");
  if (
    filterOptions &&
    !filterOptions.querySelector(".advanced-filters-trigger")
  ) {
    filterOptions.prepend(createAdvancedFiltersTriggerControl());
  }
  const main = document.querySelector("main");
  if (main && !document.querySelector(".advanced-filters-dialog")) {
    void createAdvancedFiltersDialogControl().then((control) =>
      main.append(control.dialog),
    );
  }
}
