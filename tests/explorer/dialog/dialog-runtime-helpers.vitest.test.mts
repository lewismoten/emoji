import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  getIntroducedVersion,
  updateCompositionBackButton,
  updateDialogNavigation,
  withoutCompositionParent,
  withoutDialogParentPanel,
} from "../../../src/explorer/dialog/dialog-runtime-helpers.js";

class FakeButton {
  disabled = false;
  hidden = false;
  title = "";
  attributes = new Map<string, string>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
}

describe("dialog-runtime-helpers", () => {
  it("resolves versions, navigation, and composition back button state", () => {
    assert.equal(
      getIntroducedVersion({
        key: "grinningFace",
        versionKeys: new Map<string, Set<string>>([
          ["1.0", new Set(["grinningFace"])],
          ["18.0", new Set(["draftFace"])],
        ]),
        versionManifests: [{ version: "1.0" }, { version: "15.0" }],
        proposedVersionManifests: [{ version: "18.0" }],
      }),
      "1.0",
    );
    assert.equal(
      getIntroducedVersion({
        key: "draftFace",
        versionKeys: new Map<string, Set<string>>([
          ["18.0", new Set(["draftFace"])],
        ]),
        versionManifests: [{ version: "1.0" }],
        proposedVersionManifests: [{ version: "18.0" }],
      }),
      "18.0",
    );
    assert.equal(
      getIntroducedVersion({
        key: "missing",
        versionKeys: new Map(),
        versionManifests: [],
        proposedVersionManifests: [],
      }),
      "—",
    );

    assert.deepEqual(
      withoutCompositionParent({ compositionParent: "wave", keep: true }),
      {
        keep: true,
      },
    );
    assert.deepEqual(withoutCompositionParent(undefined), {});
    assert.deepEqual(
      withoutDialogParentPanel({ dialogParentPanel: "help", keep: true }),
      {
        keep: true,
      },
    );
    assert.deepEqual(withoutDialogParentPanel(null), {});

    const previous = new FakeButton();
    const next = new FakeButton();
    let backUpdates = 0;
    updateDialogNavigation({
      currentEmojiKey: "wave",
      dialogNavigationKeys: ["grin", "wave", "gift"],
      displayedKeys: ["fallback"],
      emojiNext: next as any,
      emojiPrevious: previous as any,
      updateCompositionBackButton: () => {
        backUpdates += 1;
      },
    });
    assert.equal(previous.disabled, false);
    assert.equal(next.disabled, false);
    assert.equal(backUpdates, 1);

    updateDialogNavigation({
      currentEmojiKey: "fallback",
      dialogNavigationKeys: [],
      displayedKeys: ["fallback"],
      emojiNext: next as any,
      emojiPrevious: previous as any,
      updateCompositionBackButton: () => {
        backUpdates += 1;
      },
    });
    assert.equal(previous.disabled, true);
    assert.equal(next.disabled, true);
    assert.equal(backUpdates, 2);

    updateDialogNavigation({
      currentEmojiKey: "unknown",
      dialogNavigationKeys: ["grin", "wave"],
      displayedKeys: [],
      updateCompositionBackButton: () => {
        backUpdates += 1;
      },
    });
    assert.equal(backUpdates, 3);

    const hiddenParent = new FakeButton();
    updateCompositionBackButton({
      byId: {},
      dialogParentPanel: "",
      currentDialogParentStack: [],
      emojiByKey: {},
      emojiParent: hiddenParent as any,
      historyState: {},
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(hiddenParent.hidden, true);
    assert.equal(hiddenParent.title, "");

    const compositionParent = new FakeButton();
    updateCompositionBackButton({
      byId: { wrappedGift: { shortName: "wrapped gift" } },
      currentDialogParentStack: [],
      emojiByKey: { wrappedGift: "🎁" },
      emojiParent: compositionParent as any,
      historyState: { compositionParent: "wrappedGift" },
      searchAnnotations: { wrappedGift: ["gift", "present"] },
      translate: (_key, fallback) => fallback,
    });
    assert.equal(compositionParent.hidden, false);
    assert.equal(compositionParent.title, "Back to emoji: gift");
    assert.equal(
      compositionParent.getAttribute("aria-label"),
      "Back to emoji: gift",
    );

    const stackParent = new FakeButton();
    updateCompositionBackButton({
      byId: {},
      currentDialogParentStack: ["favorites"],
      emojiByKey: {},
      emojiParent: stackParent as any,
      historyState: { dialogParentPanel: "help" },
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(stackParent.hidden, false);
    assert.equal(stackParent.title, "Back to Favorites");

    const dialogPanelParent = new FakeButton();
    updateCompositionBackButton({
      byId: {},
      dialogParentPanel: "language",
      currentDialogParentStack: [],
      emojiByKey: {},
      emojiParent: dialogPanelParent as any,
      historyState: {},
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(dialogPanelParent.title, "Back to Language");

    const helpPanelParent = new FakeButton();
    updateCompositionBackButton({
      byId: {},
      dialogParentPanel: "help",
      currentDialogParentStack: [],
      emojiByKey: {},
      emojiParent: helpPanelParent as any,
      historyState: {},
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(helpPanelParent.title, "Back to Help");

    const historyPanelParent = new FakeButton();
    updateCompositionBackButton({
      byId: {},
      currentDialogParentStack: [],
      emojiByKey: {},
      emojiParent: historyPanelParent as any,
      historyState: { dialogParentPanel: "custom" },
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(historyPanelParent.title, "Back");

    const missingCompositionParent = new FakeButton();
    updateCompositionBackButton({
      byId: { wrappedGift: { shortName: "wrapped gift" } },
      currentDialogParentStack: [],
      emojiByKey: {},
      emojiParent: missingCompositionParent as any,
      historyState: { compositionParent: "wrappedGift" },
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
    assert.equal(missingCompositionParent.hidden, true);
    assert.equal(missingCompositionParent.title, "");

    updateCompositionBackButton({
      byId: {},
      currentDialogParentStack: [],
      emojiByKey: {},
      historyState: {},
      searchAnnotations: {},
      translate: (_key, fallback) => fallback,
    });
  });
});
