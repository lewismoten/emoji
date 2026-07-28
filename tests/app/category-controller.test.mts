import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceText = await fs.readFile(
  path.join(root, "src/app/category-controller.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import {\n  closeFilterPicker as closeFilterPickerHelper,\n  displayUnicodeSubGroupName as displayUnicodeSubGroupNameHelper,\n  focusCompactChoice as focusCompactChoiceHelper,\n  onCompactChoiceKeyDown as onCompactChoiceKeyDownHelper,\n  openFilterPicker as openFilterPickerHelper,\n} from "../explorer/filter-picker.js";',
    'import {\n  closeFilterPicker as closeFilterPickerHelper,\n  displayUnicodeSubGroupName as displayUnicodeSubGroupNameHelper,\n  focusCompactChoice as focusCompactChoiceHelper,\n  onCompactChoiceKeyDown as onCompactChoiceKeyDownHelper,\n  openFilterPicker as openFilterPickerHelper,\n} from "./filter-picker-stub.mjs";',
  )
  .replace(
    'import { createCategoryFilterRenderer } from "../explorer/category-filter-render.js";',
    'import { createCategoryFilterRenderer } from "./category-filter-render-stub.mjs";',
  )
  .replace(
    'import { buildCategoryRepresentatives } from "../category-representatives.js";',
    'import { buildCategoryRepresentatives } from "./category-representatives-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/group: string/g, "group")
  .replace(/subGroup: string/g, "subGroup")
  .replace(/name: string/g, "name")
  .replace(/event: any/g, "event")
  .replace(/value: string\[\]/g, "value")
  .replace(/value: string/g, "value")
  .replace(/\(button: HTMLButtonElement\)/g, "(button)");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "category-controller-test-"),
);
const moduleFile = path.join(tempDirectory, "category-controller.mjs");
const filterPickerStubFile = path.join(tempDirectory, "filter-picker-stub.mjs");
const categoryRendererStubFile = path.join(
  tempDirectory,
  "category-filter-render-stub.mjs",
);
const representativesStubFile = path.join(
  tempDirectory,
  "category-representatives-stub.mjs",
);

await fs.writeFile(
  filterPickerStubFile,
  [
    "export const closeFilterPicker = Symbol('closeFilterPicker');",
    "export const focusCompactChoice = Symbol('focusCompactChoice');",
    "export const onCompactChoiceKeyDown = Symbol('onCompactChoiceKeyDown');",
    "export const openFilterPicker = Symbol('openFilterPicker');",
    "export const displayUnicodeCalls = [];",
    "export function displayUnicodeSubGroupName(name, options) {",
    "  displayUnicodeCalls.push({ name, options });",
    "  return `unicode:${name}`;",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  categoryRendererStubFile,
  [
    "export let lastOptions;",
    "export let renderCalls = 0;",
    "export const updateCalls = [];",
    "export function createCategoryFilterRenderer(options) {",
    "  lastOptions = options;",
    "  return {",
    "    renderCategoryFilters() {",
    "      renderCalls += 1;",
    "      return 'rendered';",
    "    },",
    "    updateAvailableCategories(...args) {",
    "      updateCalls.push(args);",
    "      return { kind: 'updated', args };",
    "    },",
    "  };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(
  representativesStubFile,
  [
    "export let lastArguments;",
    "export function buildCategoryRepresentatives(options) {",
    "  lastArguments = options;",
    "  return {",
    "    groups: new Map([['Smileys & Emotion', '😀']]),",
    "    subGroups: new Map([['Smileys & Emotion::face-smiling', '😄']]),",
    "  };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const exportedCreateCategoryController: typeof import("../../src/app/category-controller.js").createCategoryController =
  module.createCategoryController;
assert.equal(typeof exportedCreateCategoryController, "function");
const filterPickerStub = await import(pathToFileURL(filterPickerStubFile).href);
const categoryRendererStub = await import(
  pathToFileURL(categoryRendererStubFile).href
);
const representativesStub = await import(
  pathToFileURL(representativesStubFile).href
);

const state: any = {
  searchLabels: { smileysLabel: "Localized Smileys" },
  searchSubgroupLabels: { "face-smiling": "Localized Subgroup" },
  groups: [],
  items: [{ key: "grinningFace" }],
  proposedVersionManifests: { "18.0": {} },
  versionManifests: { "17.0": {} },
  subGroups: ["face-smiling"],
  versionKeys: ["17.0", "18.0"],
  groupRepresentativeEmoji: new Map<string, string>(),
  subGroupRepresentativeEmoji: new Map<string, string>(),
  selectedGroup: "",
  selectedSubGroup: "",
  selectedSequenceType: "",
  orderMode: "unicode",
  availableGroups: [],
  availableSequenceTypes: [],
  availableSubGroups: [],
  availableCategoryKeys: [],
};

const drawListCalls: string[] = [];
const savePreferenceCalls: unknown[][] = [];
let syncVersionRangeCalls = 0;
const groupSelector = { value: "Smileys & Emotion" };
const subGroupSelector = { value: "face-smiling" };
const sequenceTypeSelector = { value: "zwj" };

function button(order: string) {
  const classes = new Set<string>();
  const attributes = new Map<string, string>();
  return {
    dataset: { order },
    classList: {
      toggle(name: string, active: boolean) {
        if (active) classes.add(name);
        else classes.delete(name);
      },
      contains(name: string) {
        return classes.has(name);
      },
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null;
    },
  };
}

const unicodeButton = button("unicode");
const sequenceButton = button("sequence");
const groupButton = button("groups");

const controller = module.createCategoryController({
  compactGroupChoices: Symbol("compactGroupChoices"),
  compactGroupLabel: Symbol("compactGroupLabel"),
  compactSequenceChoices: Symbol("compactSequenceChoices"),
  compactSequenceLabel: Symbol("compactSequenceLabel"),
  compactSubGroupChoices: Symbol("compactSubGroupChoices"),
  compactSubGroupLabel: Symbol("compactSubGroupLabel"),
  developerModeEnabled: () => false,
  drawList: () => {
    drawListCalls.push("draw");
  },
  getVersionKeys: () => state.versionKeys,
  groupFilterDialog: Symbol("groupFilterDialog"),
  groupPickerTrigger: Symbol("groupPickerTrigger"),
  groupSelector: () => groupSelector,
  orderButtons: () => [unicodeButton, sequenceButton, groupButton],
  savePreference: (...args: unknown[]) => {
    savePreferenceCalls.push(args);
  },
  sequenceTranslationKeys: { zwj: "zwjLabel" },
  sequenceTypeEmoji: { zwj: "🧩" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  sequenceTypeOrder: ["zwj"],
  sequenceTypeSelector: () => sequenceTypeSelector,
  state: () => state,
  subGroupFilterDialog: Symbol("subGroupFilterDialog"),
  subGroupPickerTrigger: Symbol("subGroupPickerTrigger"),
  subGroupSelector: () => subGroupSelector,
  syncVersionRange: () => {
    syncVersionRangeCalls += 1;
  },
  translate: (value: string) => `translated:${value}`,
  unicodeGroupLabelKeys: {
    "Smileys & Emotion": "smileysLabel",
  },
  unicodeSubgroupLabelKeys: {
    "face-smiling": "faceSmilingLabel",
  },
});

assert.equal(controller.closeFilterPicker, filterPickerStub.closeFilterPicker);
assert.equal(controller.focusCompactChoice, filterPickerStub.focusCompactChoice);
assert.equal(
  controller.onCompactChoiceKeyDown,
  filterPickerStub.onCompactChoiceKeyDown,
);
assert.equal(controller.openFilterPicker, filterPickerStub.openFilterPicker);

assert.equal(
  controller.subGroupSelectionKey("Smileys & Emotion", "face-smiling"),
  "Smileys & Emotion::face-smiling",
);
assert.equal(controller.displayGroupName("Smileys & Emotion"), "Localized Smileys");
assert.equal(controller.displayGroupName("Objects"), "Objects");
assert.equal(
  controller.displayUnicodeSubGroupName("face-smiling"),
  "unicode:face-smiling",
);
assert.equal(filterPickerStub.displayUnicodeCalls.length, 1);
assert.equal(
  filterPickerStub.displayUnicodeCalls[0].options.unicodeSubgroupLabelKeys["face-smiling"],
  "faceSmilingLabel",
);

controller.buildRepresentatives();
assert.equal(representativesStub.lastArguments.subGroupKey("a", "b"), "a::b");
assert.equal(state.groupRepresentativeEmoji.get("Smileys & Emotion"), "😀");
assert.equal(
  state.subGroupRepresentativeEmoji.get("Smileys & Emotion::face-smiling"),
  "😄",
);
assert.equal(controller.getGroupRepresentativeEmoji("Smileys & Emotion"), "😀");
assert.equal(
  controller.getSubGroupRepresentativeEmoji("Smileys & Emotion", "face-smiling"),
  "😄",
);
assert.equal(controller.getGroupRepresentativeEmoji("Missing"), "");
assert.equal(
  controller.getSubGroupRepresentativeEmoji("Missing", "Unknown"),
  "",
);

controller.onGroupSelectorChange();
assert.equal(state.selectedGroup, "Smileys & Emotion");
assert.equal(state.selectedSubGroup, "");
assert.equal(categoryRendererStub.renderCalls, 1);
assert.equal(drawListCalls.length, 1);

controller.onSubGroupSelectorChange();
assert.equal(state.selectedSubGroup, "face-smiling");
assert.equal(categoryRendererStub.renderCalls, 2);
assert.equal(drawListCalls.length, 2);

controller.onSequenceTypeSelectorChange();
assert.equal(state.selectedSequenceType, "zwj");
assert.equal(categoryRendererStub.renderCalls, 3);
assert.equal(drawListCalls.length, 3);

controller.onOrderModeChange({ currentTarget: sequenceButton });
assert.equal(state.orderMode, "unicode");
assert.equal(savePreferenceCalls.length, 0);
assert.equal(categoryRendererStub.renderCalls, 3);

const devModeController = module.createCategoryController({
  compactGroupChoices: Symbol("compactGroupChoices"),
  compactGroupLabel: Symbol("compactGroupLabel"),
  compactSequenceChoices: Symbol("compactSequenceChoices"),
  compactSequenceLabel: Symbol("compactSequenceLabel"),
  compactSubGroupChoices: Symbol("compactSubGroupChoices"),
  compactSubGroupLabel: Symbol("compactSubGroupLabel"),
  developerModeEnabled: () => true,
  drawList: () => {
    drawListCalls.push("draw");
  },
  getVersionKeys: () => state.versionKeys,
  groupFilterDialog: Symbol("groupFilterDialog"),
  groupPickerTrigger: Symbol("groupPickerTrigger"),
  groupSelector: () => groupSelector,
  orderButtons: () => [unicodeButton, sequenceButton, groupButton],
  savePreference: (...args: unknown[]) => {
    savePreferenceCalls.push(args);
  },
  sequenceTranslationKeys: { zwj: "zwjLabel" },
  sequenceTypeEmoji: { zwj: "🧩" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  sequenceTypeOrder: ["zwj"],
  sequenceTypeSelector: () => sequenceTypeSelector,
  state: () => state,
  subGroupFilterDialog: Symbol("subGroupFilterDialog"),
  subGroupPickerTrigger: Symbol("subGroupPickerTrigger"),
  subGroupSelector: () => subGroupSelector,
  syncVersionRange: () => {
    syncVersionRangeCalls += 1;
  },
  translate: (value: string) => `translated:${value}`,
  unicodeGroupLabelKeys: {
    "Smileys & Emotion": "smileysLabel",
  },
  unicodeSubgroupLabelKeys: {
    "face-smiling": "faceSmilingLabel",
  },
});

devModeController.onOrderModeChange({ currentTarget: sequenceButton });
assert.equal(state.orderMode, "sequence");
assert.deepEqual(savePreferenceCalls.at(-1), ["order", "sequence"]);
assert.equal(sequenceButton.classList.contains("is-active"), true);
assert.equal(sequenceButton.getAttribute("aria-pressed"), "true");
assert.equal(unicodeButton.getAttribute("aria-pressed"), "false");
assert.equal(categoryRendererStub.renderCalls, 4);
assert.equal(drawListCalls.length, 4);

state.groups = [];
controller.refreshLocalizedLabels();
assert.equal(syncVersionRangeCalls, 0);
assert.equal(drawListCalls.length, 4);

state.groups = ["Smileys & Emotion"];
controller.refreshLocalizedLabels();
assert.equal(categoryRendererStub.renderCalls, 5);
assert.equal(syncVersionRangeCalls, 1);
assert.equal(drawListCalls.length, 5);

const updateResult = controller.updateAvailableCategories("a", "b");
assert.deepEqual(updateResult, { kind: "updated", args: ["a", "b"] });
assert.deepEqual(categoryRendererStub.updateCalls, [["a", "b"]]);

assert.equal(categoryRendererStub.lastOptions.displayGroupName("Objects"), "Objects");
assert.equal(
  categoryRendererStub.lastOptions.displayGroupName("Smileys & Emotion"),
  "Localized Smileys",
);
assert.equal(
  categoryRendererStub.lastOptions.getGroupRepresentativeEmoji("Smileys & Emotion"),
  "😀",
);
