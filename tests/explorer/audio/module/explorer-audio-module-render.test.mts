import assert from "node:assert/strict";
import {
  installExplorerAudioDomFixture,
  loadExplorerAudioModuleFixture,
} from "./explorer-audio-module-fixture.mjs";

const fixture = installExplorerAudioDomFixture();
const { module } = await loadExplorerAudioModuleFixture();

try {
  const preferences: {
    explorerPreferences: Record<string, unknown>;
  } = { explorerPreferences: { music: true, soundEffects: false } };
  const saves: Array<[string, unknown]> = [];
  const controller = module.createExplorerAudioController({
    savePreference(key: string, value: unknown) {
      preferences.explorerPreferences[key] = value;
      saves.push([key, value]);
    },
    state: () => preferences,
  });

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

  controller.bindAudioInteractions();
  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]({ target: fixture.soundToggle });
  assert.deepEqual(saves[0], ["soundEffects", true]);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "true");

  fixture.musicToggle.checked = false;
  fixture.listeners.get("change")?.[0]({ target: fixture.musicToggle });
  assert.deepEqual(saves[1], ["music", false]);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "false");

  (globalThis.document as any).documentElement.dataset.theme = "base";
  fixture.observerCallback()?.([{ type: "attributes", attributeName: "data-theme" }]);
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, true);
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "true");
  assert.equal(fixture.musicToggle.checked, false);
  assert.equal(fixture.musicToggle.disabled, true);
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "true");

  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]({ target: fixture.soundToggle });
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]({ target: fixture.musicToggle });
  assert.deepEqual(saves, [["soundEffects", true], ["music", false]]);
} finally {
  fixture.restore();
}
