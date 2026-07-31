import assert from "node:assert/strict";
import { loadStartupOrchestratorFixture } from "./startup-orchestrator-fixture.mjs";

const {
  dialogRoot,
  dialogUpgradeStub,
  loadingStateStub,
  orchestrator,
  restore,
} = await loadStartupOrchestratorFixture();

try {
  orchestrator.finishExplorerLoading();
  assert.equal(loadingStateStub.finishCalls.length, 1);
  assert.equal(
    loadingStateStub.finishCalls[0].applyPixelArtworkClass,
    "apply-pixel-artwork-class",
  );
  assert.deepEqual(loadingStateStub.finishCalls[0].emojiByKey, { wave: "👋" });

  orchestrator.revealExplorer();
  assert.deepEqual(loadingStateStub.revealCalls[0], [
    "emoji-list",
    "match-count",
  ]);

  orchestrator.upgradeEmojiDialog();
  assert.equal(dialogUpgradeStub.calls.length, 1);
  assert.equal(
    dialogUpgradeStub.calls[0].ensureImportExamples,
    "ensure-import-examples",
  );
  assert.equal(dialogUpgradeStub.calls[0].exampleDialog, "dialog-node");
  assert.equal(typeof dialogUpgradeStub.calls[0].translate, "function");

  orchestrator.removeLegacyDialogElements();
  assert.deepEqual(dialogRoot.removed, [
    "copiedDescription",
    "example-link",
    "copy-emoji",
    "emoji-code-points:closest",
    "metadata-codePoints:closest",
  ]);
} finally {
  restore();
}
