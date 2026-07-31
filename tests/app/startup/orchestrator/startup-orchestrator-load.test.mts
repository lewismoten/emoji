import assert from "node:assert/strict";
import { loadStartupOrchestratorFixture } from "./startup-orchestrator-fixture.mjs";

const { calls, orchestrator, restore } = await loadStartupOrchestratorFixture();

try {
  await orchestrator.onLoad();
  assert.deepEqual(calls.assignElements[0], { emojiList: "emoji-list-node" });
  assert.deepEqual(calls.assignControls[0], {
    initializedWith: {
      createFilterControlSetup: "create-filter-control-setup",
      groupFilterDialog: "group-filter-dialog",
      groupPickerTrigger: "group-picker-trigger",
      groupSelector: "group-selector",
      onCompactChoiceKeyDown: "on-compact-choice-keydown",
      openFilterPicker: "open-filter-picker",
      populateVersionModeOptions: "populate-version-mode-options",
      renderDeveloperMode: "render-developer-mode",
      subGroupFilterDialog: "subgroup-filter-dialog",
      subGroupPickerTrigger: "subgroup-picker-trigger",
      subGroupSelector: "subgroup-selector",
      versionModeSelector: "version-mode-selector",
      versionRange: calls.assignControls[0].initializedWith.versionRange,
      versionSelector: "version-selector-node",
    },
  });
  assert.equal(
    typeof calls.assignControls[0].initializedWith.versionRange,
    "function",
  );
  assert.equal(calls.assignModifierFieldsets.length, 1);
  assert.equal(calls.hideModifierEmojiAccessibility.length, 1);
  assert.equal(calls.bindAudioInteractions.length, 1);
  assert.equal(calls.bindEvents.length, 1);
  assert.equal(calls.finalizeStartup.length, 1);
  assert.equal(
    calls.finalizeStartup[0].finishExplorerLoading,
    orchestrator.finishExplorerLoading,
  );
} finally {
  restore();
}
