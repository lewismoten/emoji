import assert from "node:assert/strict";
import * as preferences from "../../../../src/preferences.js";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  installPreferenceWindow,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";
import * as audioHelpers from '../../../../src/explorer/audio/audio-helpers.js';

const fixture = installAudioDomFixture();
const preferenceWindow = installPreferenceWindow({
  music: true,
  soundEffects: false,
});

try {
  preferences.init({});
  const dependencyDefaults = createExplorerAudioDependencies();
  assert.equal(typeof dependencyDefaults.createExplorerAudioEngine, "function");

  const engineCalls: Array<unknown[]> = [];
  const engine = createAudioEngineFixture(engineCalls);

  const controller = createExplorerAudioController({
    createExplorerAudioEngine(options: unknown) {
      engineCalls.push(["createExplorerAudioEngine", options]);
      return engine;
    },
  });

  const parentAttributes = new Map<string, string>();
  (fixture.soundToggle as any).parentElement = {
    setAttribute(name: string, value: string) {
      parentAttributes.set(name, value);
    },
  };
  (fixture.musicToggle as any).parentElement = {
    setAttribute(name: string, value: string) {
      parentAttributes.set(`music:${name}`, value);
    },
  };

  controller.renderSoundEffectsToggle();
  controller.renderMusicToggle();
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, false);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "false");
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "false");
  assert.equal(parentAttributes.get("aria-pressed"), "false");
  assert.equal(parentAttributes.get("aria-disabled"), "false");
  assert.equal(fixture.musicToggle.checked, true);
  assert.equal(fixture.musicToggle.disabled, false);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "true");
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "false");
  assert.equal(parentAttributes.get("music:aria-pressed"), "true");
  assert.equal(parentAttributes.get("music:aria-disabled"), "false");

  fixture.setDocument({
    body: fixture.body,
    documentElement: { dataset: { theme: "retro" } },
    hidden: false,
    addEventListener(type: string, handler: Function) {
      const list = fixture.listeners.get(type) ?? [];
      list.push(handler);
      fixture.listeners.set(type, list);
    },
    querySelector() {
      return null;
    },
  });
  controller.renderSoundEffectsToggle();
  controller.renderMusicToggle();
  fixture.setDocument();

  controller.bindAudioInteractions();
  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
  assert.equal(preferences.getBoolean("soundEffects"), true);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "true");

  preferences.setBoolean("music", false);
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.equal(preferences.getBoolean("music"), true);

  fixture.musicToggle.checked = false;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.equal(preferences.getBoolean("music"), false);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "false");

  (globalThis.document as any).documentElement.dataset.theme = "base";
  fixture.observers[1]?.callback?.([
    { type: "attributes", attributeName: "data-theme" },
  ]);
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, true);
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "true");
  assert.equal(fixture.musicToggle.checked, false);
  assert.equal(fixture.musicToggle.disabled, true);
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "true");

  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.deepEqual(preferenceWindow.read(), {
    mode: "standard",
    music: false,
    soundEffects: true,
    theme: "dark",
  });
  fixture.listeners.get("change")?.[0]?.({ target: {} });

  preferences.init({ music: false, soundEffects: false });
  const defaultDependencyController = createExplorerAudioController();
  assert.equal(typeof defaultDependencyController.bindAudioInteractions, "function");

  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Reflect.deleteProperty(globalThis, "document");
  const noDocumentCalls: Array<unknown[]> = [];
  createExplorerAudioController({
    createExplorerAudioEngine(options: any) {
      noDocumentCalls.push([
        "engine-options",
        audioHelpers.isMusicalDialogOpen(),
        audioHelpers.isMusicEnabled(),
        audioHelpers.isSoundEffectsEnabled(),
        options.retroMode(),
        options.theme(),
      ]);
      return engine;
    },
  });
  assert.deepEqual(noDocumentCalls[0], [
    "engine-options",
    false,
    false,
    true,
    false,
    "dark",
  ]);
  assert.doesNotThrow(() => defaultDependencyController.bindAudioInteractions());
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }
} finally {
  preferenceWindow.restore();
  fixture.restore();
}
