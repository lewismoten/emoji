import assert from "node:assert/strict";
import {
  createBootstrapControllersFixture,
  installBootstrapControllerDom,
} from "./explorer-bootstrap-controllers-fixture.js";

const { restore } = installBootstrapControllerDom();

try {
  const { controllerApi } = createBootstrapControllersFixture();

  for (const name of [
    "buildRepresentatives",
    "closeFilterPicker",
    "displayGroupName",
    "displayUnicodeSubGroupName",
    "drawList",
    "focusInitialAction",
    "focusCompactChoice",
    "getGroupRepresentativeEmoji",
    "getSubGroupRepresentativeEmoji",
    "getVersionKeys",
    "loadVersionData",
    "onCompactChoiceKeyDown",
    "onEmojiDialogClick",
    "onEmojiFocus",
    "onEmojiKeyDown",
    "onGroupSelectorChange",
    "onOrderModeChange",
    "onSequenceTypeSelectorChange",
    "onSubGroupSelectorChange",
    "openFilterPicker",
    "refreshLocalizedLabels",
    "renderCategoryFilters",
    "scheduleSearchDraw",
    "setView",
    "subGroupSelectionKey",
    "syncVersionRange",
    "updateActiveFilterSummary",
    "updateAvailableCategories",
    "versionSliderLabel",
  ] as const) {
    assert.equal(typeof controllerApi[name], "function");
  }

  assert.doesNotThrow(() => controllerApi.buildRepresentatives("gift"));
  assert.doesNotThrow(() => controllerApi.closeFilterPicker());
  assert.equal(controllerApi.displayGroupName("Objects"), "Objects");
  assert.equal(controllerApi.displayUnicodeSubGroupName("mail"), "Mail");
  for (const action of [
    () => controllerApi.getGroupRepresentativeEmoji(),
    () => controllerApi.getSubGroupRepresentativeEmoji(),
    () => controllerApi.getVersionKeys(),
    () =>
      controllerApi.onEmojiDialogClick({
        target: {
          closest() {
            return null;
          },
        },
      }),
    () =>
      controllerApi.onEmojiFocus({
        target: {
          closest() {
            return null;
          },
        },
      }),
    () =>
      controllerApi.onEmojiKeyDown({
        key: "Enter",
        preventDefault() {},
        target: {
          closest() {
            return null;
          },
        },
      }),
  ] as const) {
    assert.doesNotThrow(action);
  }
  assert.doesNotThrow(() => controllerApi.openFilterPicker());
  assert.doesNotThrow(() => controllerApi.refreshLocalizedLabels());
  assert.equal(
    controllerApi.subGroupSelectionKey("Objects", "mail"),
    "Objects::mail",
  );
  assert.doesNotThrow(() => controllerApi.syncVersionRange("17.0"));
  assert.doesNotThrow(() => controllerApi.updateActiveFilterSummary());
  assert.doesNotThrow(() => controllerApi.versionSliderLabel("17.0"));
} finally {
  restore();
}
