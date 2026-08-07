import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";

import { createEmojiDialogClickRuntime } from "../../../src/app/emoji/emoji-dialog-click-runtime.js";
import * as state from "../../../src/state.js";

describe("emoji-dialog-click-runtime", () => {
  beforeEach(() => {
    state.currentEmojiKey.set("grinningFace");
    state.selectedVersion.set("");
    state.selectedVersionMode.set("through");
  });

  it("targets the introduced version when the dialog version row is clicked", async () => {
    const syncUrlState = vi.fn();
    const loadVersionData = vi.fn(async () => undefined);
    const renderVersionModeToggle = vi.fn();
    const syncVersionRange = vi.fn();
    const renderCategoryFilters = vi.fn();
    const drawList = vi.fn();

    const handler = createEmojiDialogClickRuntime({
      animateCopy: vi.fn(),
      clearCurrentDialogParentStack: vi.fn(),
      copy: vi.fn(),
      currentEmojiCopies: () => ({}),
      dialog: () => ({ close() {}, dataset: {}, querySelector: () => null }),
      drawList,
      getIntroducedVersion: (key: string) =>
        key === "grinningFace" ? "16.0" : "",
      languageList: () => undefined,
      loadVersionData,
      openPanel: vi.fn(),
      panelDialogs: vi.fn(),
      recordCopiedEmoji: vi.fn(),
      renderCategoryFilters,
      renderSavedEmoji: vi.fn(),
      renderVersionModeToggle,
      setSuppressDialogCloseSync: vi.fn(),
      setView: vi.fn(),
      showEmoji: vi.fn(),
      syncUrlState,
      syncVersionRange,
      toggleComposition: vi.fn(),
      toggleFavorite: vi.fn(),
      translate: (_key: string, fallback: string) => fallback,
      updateCompositionBackButton: vi.fn(),
      updateEmojiComposition: vi.fn(),
      versionModeSelector: () => ({ value: "through" }),
      versionSelector: () => ({ value: "" }),
    });

    await handler({
      target: {
        closest: (selector: string) =>
          selector === ".emoji-version" ? { id: "version-row" } : null,
      },
    } as unknown as MouseEvent);

    assert.equal(loadVersionData.mock.calls.length, 1);
    assert.equal(state.selectedVersionMode.get(), "selected");
    assert.equal(state.selectedVersion.get(), "16.0");
    assert.equal(renderVersionModeToggle.mock.calls.length, 1);
    assert.equal(syncVersionRange.mock.calls.length, 1);
    assert.equal(renderCategoryFilters.mock.calls.length, 1);
    assert.equal(drawList.mock.calls.length, 1);
    assert.equal(syncUrlState.mock.calls.length, 1);
  });
});
