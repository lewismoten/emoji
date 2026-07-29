import assert from "node:assert/strict";
import { createListOrchestration } from "../../src/app/list-orchestration.js";

const originalDocument = globalThis.document;

const createdFragments: Array<{ parts: unknown[] }> = [];

(globalThis as any).document = {
  createDocumentFragment() {
    const fragment = {
      parts: [] as unknown[],
      append(value: unknown) {
        this.parts.push(value);
      },
      hasChildNodes() {
        return this.parts.length > 0;
      },
    };
    createdFragments.push(fragment);
    return fragment;
  },
  createTextNode(value: string) {
    return { textContent: value };
  },
};

try {
  const activeFilterSummary = { hidden: true };
  const replaced: unknown[] = [];
  const activeFilterText = {
    replaceChildren(value: unknown) {
      replaced.length = 0;
      replaced.push(value);
    },
  };

  const makeCheckbox = (value: string, checked = true) => ({
    checked,
    value,
    closest() {
      return {
        querySelector() {
          return {
            cloneNode() {
              return { glyph: value };
            },
          };
        },
      };
    },
  });

  const state: any = {
    byId: {},
    emojiByKey: {},
    focusedEmojiKey: "",
    groups: [],
    orderMode: "grouped",
    searchAnnotations: {},
    subGroups: {},
    versionManifests: [{ version: "16.0" }, { version: "17.0" }],
    allIds: new Set<string>(),
    items: [],
    displayedKeys: [],
    selectedGroup: "Objects",
    selectedSequenceType: "",
    selectedSubGroup: "Objects::mail",
    selectedSearchLocale: "en",
  };

  const runtime = createListOrchestration({
    activeFilterSummary: () => activeFilterSummary,
    activeFilterText: () => activeFilterText,
    applyPixelArtworkClass: () => {},
    displayExplorerLabel: (value: string) => value,
    displayGroupName: (value: string) => `group:${value}`,
    displayUnicodeSubGroupName: (value: string) => `subgroup:${value}`,
    formatNumber: (value: number) => String(value),
    genderCheckboxes: () => [makeCheckbox("neutral")],
    getIntroducedVersion: () => "—",
    getVersionKeys: () => new Set<string>(),
    hairCheckboxes: () => [makeCheckbox("red")],
    matchCount: () => ({ innerText: "" }),
    nextRenderGeneration: () => 1,
    onClick: () => {},
    emojiList: () => ({ dataset: {}, setAttribute() {}, replaceChildren() {} }),
    renderGeneration: () => 1,
    resetFilters: () => {},
    revealExplorer: () => {},
    searchText: () => ({ value: "mail" }),
    sequenceTranslationKeys: { single: "single" },
    sequenceTypeLabels: { single: "Single" },
    sequenceTypeOrder: ["single"],
    skinToneCheckboxes: () => [makeCheckbox("1F3FB")],
    state: () => state,
    subGroupSelectionKey: () => "",
    syncUrlState: () => {},
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
    unassigned: "unassigned",
    updateDialogNavigation: () => {},
    versionModeSelector: () => ({ value: "selected" }),
    versionSelector: () => ({ value: "17.0" }),
    versionSliderLabel: (value: string) => `version:${value}`,
  });

  runtime.updateActiveFilterSummary();

  assert.equal(activeFilterSummary.hidden, false);
  assert.equal(replaced.length, 1);
  assert.equal(createdFragments.length > 0, true);
} finally {
  (globalThis as any).document = originalDocument;
}
