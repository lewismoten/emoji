import assert from "node:assert/strict";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";

const fixture = installAudioDomFixture();

try {
  const dependencyDefaults = createExplorerAudioDependencies();
  assert.equal(typeof dependencyDefaults.createExplorerAudioEngine, "function");

  const engineCalls: Array<unknown[]> = [];
  const engine = createAudioEngineFixture(engineCalls);
  const preferences: {
    explorerPreferences: Record<string, unknown>;
  } = { explorerPreferences: { music: true, soundEffects: false } };
  const saves: Array<[string, unknown]> = [];

  const controller = createExplorerAudioController(
    {
      savePreference(key: string, value: unknown) {
        preferences.explorerPreferences[key] = value;
        saves.push([key, value]);
      },
      state: () => preferences,
    },
    {
      createExplorerAudioEngine(options: unknown) {
        engineCalls.push(["createExplorerAudioEngine", options]);
        return engine;
      },
    },
  );

  controller.renderSoundEffectsToggle();
  controller.renderMusicToggle();
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, false);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "false");
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "false");
  assert.equal(fixture.musicToggle.checked, true);
  assert.equal(fixture.musicToggle.disabled, false);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "true");
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "false");

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
  assert.deepEqual(saves[0], ["soundEffects", true]);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "true");

  preferences.explorerPreferences.music = false;
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.deepEqual(saves[1], ["music", true]);

  fixture.musicToggle.checked = false;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.deepEqual(saves[2], ["music", false]);
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
  assert.deepEqual(saves, [
    ["soundEffects", true],
    ["music", true],
    ["music", false],
  ]);
  fixture.listeners.get("change")?.[0]?.({ target: {} });
} finally {
  fixture.restore();
}
