import assert from "node:assert/strict";
import {
  installExplorerAudioDomFixture,
  loadExplorerAudioModuleFixture,
} from "./explorer-audio-module-fixture.mjs";

const fixture = installExplorerAudioDomFixture();
const { module, preferencesStub } = await loadExplorerAudioModuleFixture();
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

try {
  preferencesStub.init({ music: true, soundEffects: false });
  const controller = module.createExplorerAudioController();

  controller.bindAudioInteractions();
  await flush();
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, false);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "false");
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "false");
  assert.equal(fixture.musicToggle.checked, true);
  assert.equal(fixture.musicToggle.disabled, false);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "true");
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "false");

  fixture.soundToggle.checked = true;
  await fixture.listeners.get("change")?.[0]({ target: fixture.soundToggle });
  await flush();
  assert.equal(preferencesStub.state.soundEffects, true);
  assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "true");

  fixture.musicToggle.checked = false;
  await fixture.listeners.get("change")?.[0]({ target: fixture.musicToggle });
  await flush();
  assert.equal(preferencesStub.state.music, false);
  assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "false");

  (globalThis.document as any).documentElement.dataset.theme = "base";
  await fixture.observerCallback()?.([{ type: "attributes", attributeName: "data-theme" }]);
  assert.equal(fixture.soundToggle.checked, false);
  assert.equal(fixture.soundToggle.disabled, true);
  assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "true");
  assert.equal(fixture.musicToggle.checked, false);
  assert.equal(fixture.musicToggle.disabled, true);
  assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "true");

  fixture.soundToggle.checked = true;
  await fixture.listeners.get("change")?.[0]({ target: fixture.soundToggle });
  fixture.musicToggle.checked = true;
  await fixture.listeners.get("change")?.[0]({ target: fixture.musicToggle });
  await flush();
  assert.deepEqual(preferencesStub.state, {
    music: false,
    soundEffects: true,
  });
} finally {
  fixture.restore();
}
