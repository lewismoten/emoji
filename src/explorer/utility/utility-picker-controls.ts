import {
  createFilterPickerDialogControl,
  createFilterPickerTriggerControl,
} from "../filters/filter-picker-control.js";

type TriggerConfig = {
  controlsId: string;
  kind: string;
  kindKey: string;
  selector: string;
  triggerClassName: string;
  value: string;
  valueKey: string;
};

type DialogConfig = {
  choicesClassName: string;
  dialogClassName: string;
  id: string;
  selector: string;
  title: string;
  titleId: string;
  titleKey: string;
};

type MinimalElement = {
  append(...nodes: unknown[]): void;
  closest?(selector: string): MinimalElement | null;
  querySelector(selector: string): MinimalElement | null;
};

declare const document: {
  querySelector(selector: string): MinimalElement | null;
};

const triggerConfigs: TriggerConfig[] = [
  {
    controlsId: "group-filter-dialog",
    kind: "Group",
    kindKey: "group",
    selector: ".select-group",
    triggerClassName: "group-picker-trigger",
    value: "All",
    valueKey: "all",
  },
  {
    controlsId: "subgroup-filter-dialog",
    kind: "Sub-group",
    kindKey: "subgroup",
    selector: ".select-subgroup",
    triggerClassName: "subgroup-picker-trigger",
    value: "All",
    valueKey: "all",
  },
];

const dialogConfigs: DialogConfig[] = [
  {
    choicesClassName: "compact-group-choices",
    dialogClassName: "group-filter-dialog",
    id: "group-filter-dialog",
    selector: ".group-filter-dialog",
    title: "Choose a group",
    titleId: "group-filter-dialog-title",
    titleKey: "chooseGroup",
  },
  {
    choicesClassName: "compact-subgroup-choices",
    dialogClassName: "subgroup-filter-dialog",
    id: "subgroup-filter-dialog",
    selector: ".subgroup-filter-dialog",
    title: "Choose a sub-group",
    titleId: "subgroup-filter-dialog-title",
    titleKey: "chooseSubgroup",
  },
];

function ensurePickerTrigger(
  basicFilterGrid: MinimalElement,
  config: TriggerConfig,
) {
  if (basicFilterGrid.querySelector(`.${config.triggerClassName}`)) return;
  const field = basicFilterGrid.querySelector(config.selector)?.closest?.(
    ".filter-field",
  );
  field?.append(
    createFilterPickerTriggerControl({
      controlsId: config.controlsId,
      kind: config.kind,
      kindKey: config.kindKey,
      triggerClassName: config.triggerClassName,
      value: config.value,
      valueKey: config.valueKey,
    }),
  );
}

function ensurePickerDialog(main: MinimalElement, config: DialogConfig) {
  if (document.querySelector(config.selector)) return;
  main.append(
    createFilterPickerDialogControl({
      choicesClassName: config.choicesClassName,
      dialogClassName: config.dialogClassName,
      id: config.id,
      title: config.title,
      titleId: config.titleId,
      titleKey: config.titleKey,
    }).dialog,
  );
}

export function ensurePickerControls() {
  const basicFilterGrid = document.querySelector(".basic-filter-grid");
  if (basicFilterGrid) {
    triggerConfigs.forEach((config) => ensurePickerTrigger(basicFilterGrid, config));
  }

  const main = document.querySelector("main");
  if (main) dialogConfigs.forEach((config) => ensurePickerDialog(main, config));
}
