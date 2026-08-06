import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

import {
  bindPanelDialog,
  closePanelDialog,
  ensurePanelDialogLifecycleBound,
  focusPanelDialog,
  getInstalledDisplayQueries,
  getOpenPanel,
  getPanelDialog,
  installApp,
  isInstalledApp,
  isIosDevice,
  onPanelDialogClose,
  openPanelDialog,
  renderInstallAppButton,
  updateWebAppManifest,
} from "../../../src/explorer/pwa/pwa-panels.js";
import {
  FakeDialog,
  installPwaGlobals,
  restorePwaGlobals,
} from "./fixtures/pwa-panels-fixture.mjs";
import { assertPanelResolutionAndFocus } from "./fixtures/pwa-panels-focus-fixture.mjs";
import { assertPanelLifecycleAndBinding } from "./fixtures/pwa-panels-lifecycle-fixture.mjs";
import { assertInstallFlowAndManifest } from "./fixtures/pwa-panels-install-fixture.mjs";

afterAll(() => {
  restorePwaGlobals();
});

describe("pwa-panels", () => {
  it("covers panel resolution, focus, install flow, and dialog lifecycle behavior", async () => {
    const {
      documentStub,
      historyBackCalls,
      historyState,
      manifestLink,
      mediaQueries,
      windowStub,
    } = installPwaGlobals();

    await assertInstallFlowAndManifest({
      documentStub,
      getInstalledDisplayQueries,
      installApp,
      isInstalledApp,
      isIosDevice,
      manifestLink,
      mediaQueries,
      renderInstallAppButton,
      updateWebAppManifest,
      windowStub,
    });

    const { dialogs, languageList, suppressedPanelCloses } =
      assertPanelResolutionAndFocus({
        focusPanelDialog,
        getOpenPanel,
        getPanelDialog,
      });

    await assertPanelLifecycleAndBinding({
      bindPanelDialog,
      closePanelDialog,
      dialogs,
      ensurePanelDialogLifecycleBound,
      historyBackCalls,
      historyState,
      languageList,
      onPanelDialogClose,
      openPanelDialog,
      suppressedPanelCloses,
      windowStub,
    });
  });
});
