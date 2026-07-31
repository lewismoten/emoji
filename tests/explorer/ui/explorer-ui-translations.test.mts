import assert from "node:assert/strict";
import { createExplorerUiController } from "../../../src/explorer-ui.js";
import { createElement, installExplorerUiFixture } from "./explorer-ui-fixture.mjs";

const fixture = installExplorerUiFixture();

try {
  const state = {
    developerModeFromUrl: true,
    explorerModeFromUrl: "developer",
    developerModeUrlDismissed: false,
    explorerPreferences: {
      developerMode: false,
      music: true,
      pixelFont: true,
      soundEffects: false,
      theme: "base",
    },
    uiStrings: {} as Record<string, string>,
  };

  const calls: string[] = [];
  const installButton = createElement();
  const installDialog = createElement();
  const pixelEditor = {
    refreshTranslations: () => calls.push("refresh-translations"),
  };
  let deferredInstallPrompt: unknown = { prompt: true };

  const controller = createExplorerUiController({
    deferredInstallPrompt: () => deferredInstallPrompt,
    installAppButton: () => installButton,
    installDialog: () => installDialog,
    installWebApp: async (payload: Record<string, unknown>) => {
      calls.push(
        `install:${String(payload.renderInstallAppButton !== undefined)}`,
      );
      return { deferredInstallPrompt: { accepted: true } };
    },
    offlineStatus: () => fixture.offlineStatus,
    pixelEditor: () => pixelEditor,
    renderDeveloperMode: () => calls.push("render-developer-mode"),
    renderInstallAppButton: (button: unknown) => {
      assert.equal(button, installButton);
      calls.push("render-install");
    },
    renderMusicToggle: () => calls.push("render-music"),
    renderPixelFontToggle: () => calls.push("render-pixel"),
    renderSearchLanguages: () => calls.push("render-search-languages"),
    renderSoundEffectsToggle: () => calls.push("render-sfx"),
    renderVersionModeToggle: () => calls.push("render-version"),
    setDeferredInstallPrompt: (value: unknown) => {
      deferredInstallPrompt = value;
      calls.push("set-install-prompt");
    },
    state: () => state,
  });

  assert.equal(typeof controller.applyTranslations, "function");
  assert.equal(typeof controller.installApp, "function");
  assert.equal(typeof controller.loadUiTranslations, "function");
  assert.equal(typeof controller.renderInstallAppButton, "function");
  assert.equal(typeof controller.updateOnlineStatus, "function");

  controller.updateOnlineStatus();
  assert.equal(
    fixture.offlineStatus.textContent,
    "Offline — showing saved data",
  );
  assert.equal(fixture.offlineStatus.hidden, false);

  controller.renderInstallAppButton();
  assert.ok(calls.includes("render-install"));

  controller.applyTranslations();
  assert.ok(calls.includes("refresh-translations"));

  await controller.loadUiTranslations("en-US");
  assert.deepEqual(fixture.fetchCalls, [
    "demo-locales/ui.en.json",
    "demo-locales/ui.en-US.json",
    "src/demo-locales/ui.en.json",
    "src/demo-locales/ui.en-US.json",
  ]);
  assert.equal(state.uiStrings.title, "Emoji Explorer");
  assert.equal(fixture.i18nText.textContent, "Emoji Explorer");
  assert.equal(fixture.i18nPlaceholder.placeholder, "Find emoji");
  assert.equal(fixture.i18nAria.attributes.get("aria-label"), "Theme label");
  assert.equal(fixture.documentElement.lang, "en-US");
  assert.equal(fixture.documentElement.dir, "ltr");
  assert.equal(
    (globalThis.document as any).title,
    "Emoji Explorer – Unicode Emoji",
  );
  assert.equal(fixture.appMeta.content, "Emoji Explorer");
  assert.equal(fixture.appleMeta.content, "Emoji Explorer");
  assert.ok(calls.includes("render-version"));
  assert.ok(calls.includes("render-search-languages"));

  await controller.installApp(new Event("click"));
  assert.deepEqual(deferredInstallPrompt, { accepted: true });
  assert.ok(calls.includes("set-install-prompt"));

  fixture.fetchCalls.length = 0;
  await controller.loadUiTranslations("ar", true);
  assert.deepEqual(fixture.fetchCalls, ["demo-locales/ui.ar.json"]);
  assert.equal(fixture.documentElement.lang, "ar");
  assert.equal(fixture.documentElement.dir, "rtl");
  assert.equal(
    (globalThis.document as any).title,
    "مستكشف الإيموجي – Unicode Emoji",
  );

  fixture.setFetch(async () => ({
    ok: false,
    async json() {
      return {};
    },
  }));
  await controller.loadUiTranslations("zz-ZZ");
  assert.deepEqual(state.uiStrings, {});
  assert.equal(fixture.documentElement.lang, "en");
  assert.equal(fixture.documentElement.dir, "ltr");
  assert.equal(
    (globalThis.document as any).title,
    "Emoji Explorer – Unicode Emoji",
  );
} finally {
  fixture.restore();
}
