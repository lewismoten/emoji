import {
  createFilterPickerDialogControl,
  createFilterPickerTriggerControl,
} from "./filter-picker-control.js";

type MinimalElement = {
  append(...nodes: unknown[]): void;
  closest?(selector: string): MinimalElement | null;
  querySelector(selector: string): MinimalElement | null;
};

declare const document: {
  querySelector(selector: string): MinimalElement | null;
};

export function ensurePickerControls() {
  const basicFilterGrid = document.querySelector(".basic-filter-grid");
  if (
    basicFilterGrid &&
    !basicFilterGrid.querySelector(".group-picker-trigger")
  ) {
    const groupField = basicFilterGrid.querySelector(
      ".select-group",
    )?.closest?.(".filter-field");
    groupField?.append(
      createFilterPickerTriggerControl({
        controlsId: "group-filter-dialog",
        kind: "Group",
        kindKey: "group",
        triggerClassName: "group-picker-trigger",
        value: "All",
        valueKey: "all",
      }),
    );
  }
  if (
    basicFilterGrid &&
    !basicFilterGrid.querySelector(".subgroup-picker-trigger")
  ) {
    const subGroupField = basicFilterGrid.querySelector(
      ".select-subgroup",
    )?.closest?.(".filter-field");
    subGroupField?.append(
      createFilterPickerTriggerControl({
        controlsId: "subgroup-filter-dialog",
        kind: "Sub-group",
        kindKey: "subgroup",
        triggerClassName: "subgroup-picker-trigger",
        value: "All",
        valueKey: "all",
      }),
    );
  }

  const main = document.querySelector("main");
  if (main && !document.querySelector(".group-filter-dialog")) {
    main.append(
      createFilterPickerDialogControl({
        choicesClassName: "compact-group-choices",
        dialogClassName: "group-filter-dialog",
        id: "group-filter-dialog",
        title: "Choose a group",
        titleId: "group-filter-dialog-title",
        titleKey: "chooseGroup",
      }).dialog,
    );
  }
  if (main && !document.querySelector(".subgroup-filter-dialog")) {
    main.append(
      createFilterPickerDialogControl({
        choicesClassName: "compact-subgroup-choices",
        dialogClassName: "subgroup-filter-dialog",
        id: "subgroup-filter-dialog",
        title: "Choose a sub-group",
        titleId: "subgroup-filter-dialog-title",
        titleKey: "chooseSubgroup",
      }).dialog,
    );
  }
}
