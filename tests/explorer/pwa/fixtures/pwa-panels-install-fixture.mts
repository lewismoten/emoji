import assert from "node:assert/strict";

import { FakeDialog, FakeElement } from "./pwa-panels-fixture.mjs";

export async function assertInstallFlowAndManifest(options: {
  getInstalledDisplayQueries: () => unknown[];
  installApp: (options: any) => Promise<{ deferredInstallPrompt?: unknown }>;
  isInstalledApp: () => boolean;
  isIosDevice: () => boolean;
  renderInstallAppButton: (button?: HTMLElement) => void;
  updateWebAppManifest: (locale: string) => void;
  documentStub: { referrer: string };
  manifestLink: FakeElement;
  mediaQueries: Array<{ matches: boolean }>;
  windowStub: any;
}) {
  const {
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
  } = options;

  assert.equal(getInstalledDisplayQueries().length, 4);
  assert.equal(isInstalledApp(), true);

  mediaQueries[1].matches = false;
  windowStub.navigator.standalone = true;
  assert.equal(isInstalledApp(), true);

  windowStub.navigator.standalone = false;
  documentStub.referrer = "android-app://emoji";
  assert.equal(isInstalledApp(), true);
  documentStub.referrer = "";

  windowStub.navigator.userAgentData = { platform: "macOS" };
  assert.equal(isIosDevice(), false);
  windowStub.navigator.userAgentData = undefined;
  assert.equal(isIosDevice(), true);
  windowStub.navigator.userAgent = "Macintosh Mobile";
  windowStub.navigator.maxTouchPoints = 2;
  assert.equal(isIosDevice(), true);
  windowStub.navigator.userAgent = "iPhone";

  const installButton = new FakeElement();
  renderInstallAppButton(installButton as any);
  assert.equal(installButton.hidden, false);
  renderInstallAppButton(undefined);

  updateWebAppManifest("ar");
  assert.equal(manifestLink.getAttribute("href"), "./manifest.ar.webmanifest");
  updateWebAppManifest("");
  assert.equal(manifestLink.getAttribute("href"), "./manifest.webmanifest");

  const iosInstructions = new FakeElement();
  const browserInstructions = new FakeElement();
  const installDialog = new FakeDialog();
  installDialog.queryMap.set(".install-instructions-ios", iosInstructions);
  installDialog.queryMap.set(
    ".install-instructions-browser",
    browserInstructions,
  );
  const noPromptResult = await installApp({
    deferredInstallPrompt: undefined,
    installDialog: installDialog as any,
    renderInstallAppButton() {},
  });
  assert.equal(noPromptResult.deferredInstallPrompt, undefined);
  assert.equal(installDialog.open, true);
  assert.equal(iosInstructions.hidden, false);
  assert.equal(browserInstructions.hidden, true);

  let prompted = 0;
  let renderedInstallButton = 0;
  const trigger = new FakeElement();
  const promptResult = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        prompted += 1;
      },
      userChoice: Promise.resolve({}),
    } as any,
    event: { currentTarget: trigger, detail: 1 } as any,
    renderInstallAppButton() {
      renderedInstallButton += 1;
    },
  });
  assert.equal(prompted, 1);
  assert.equal(renderedInstallButton, 1);
  assert.equal(trigger.blurred, true);
  assert.equal(promptResult.deferredInstallPrompt, undefined);

  const failedPrompt = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw new Error("cancelled");
      },
      userChoice: Promise.resolve({}),
    } as any,
    renderInstallAppButton() {},
  });
  assert.equal(failedPrompt.deferredInstallPrompt, undefined);

  const abortedPrompt = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw { name: "AbortError" };
      },
      userChoice: Promise.resolve({}),
    } as any,
    renderInstallAppButton() {},
  });
  assert.equal(abortedPrompt.deferredInstallPrompt, undefined);
}
