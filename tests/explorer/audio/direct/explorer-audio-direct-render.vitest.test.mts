import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import * as preferences from "../../../../src/preferences.js";
import * as audioToggle from "../../../../src/controls/audio/audio-toggle.js";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  installPreferenceWindow,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";
import * as audioHelpers from "../../../../src/explorer/audio/audio-helpers.js";

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("explorer-audio-direct-render", () => {
  const fixture = installAudioDomFixture();
  const preferenceWindow = installPreferenceWindow({
    music: true,
    soundEffects: false,
  });

  afterEach(() => {
    preferences.init({});
  });

  it("renders direct audio toggles and document fallbacks", async () => {
    preferences.init({});
    const dependencyDefaults = createExplorerAudioDependencies();
    assert.equal(typeof dependencyDefaults.createExplorerAudioEngine, "function");

    const engineCalls: Array<unknown[]> = [];
    const engine = createAudioEngineFixture(engineCalls);

    const controller = createExplorerAudioController({
      createExplorerAudioEngine() {
        engineCalls.push(["createExplorerAudioEngine"]);
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

    await audioToggle.renderSoundEffects();
    await audioToggle.renderMusic();
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
    await audioToggle.renderSoundEffects();
    await audioToggle.renderMusic();
    fixture.setDocument();

    controller.bindAudioInteractions();
    fixture.soundToggle.checked = true;
    await fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
    await flush();
    assert.equal(preferences.getBoolean("soundEffects"), true);
    assert.equal(fixture.soundToggle.attributes.get("aria-checked"), "true");

    preferences.setBoolean("music", false);
    fixture.musicToggle.checked = true;
    await fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
    await flush();
    assert.equal(preferences.getBoolean("music"), true);

    fixture.musicToggle.checked = false;
    await fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
    await flush();
    assert.equal(preferences.getBoolean("music"), false);
    assert.equal(fixture.musicToggle.attributes.get("aria-checked"), "false");

    (globalThis.document as any).documentElement.dataset.theme = "base";
    await fixture.observers[1]?.callback?.([
      { type: "attributes", attributeName: "data-theme" },
    ]);
    await flush();
    assert.equal(fixture.soundToggle.checked, false);
    assert.equal(fixture.soundToggle.disabled, true);
    assert.equal(fixture.soundToggle.attributes.get("aria-disabled"), "true");
    assert.equal(fixture.musicToggle.checked, false);
    assert.equal(fixture.musicToggle.disabled, true);
    assert.equal(fixture.musicToggle.attributes.get("aria-disabled"), "true");

    fixture.soundToggle.checked = true;
    await fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
    fixture.musicToggle.checked = true;
    await fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
    await flush();
    assert.deepEqual(preferenceWindow.read(), {
      mode: "standard",
      music: false,
      soundEffects: true,
      theme: "dark",
    });
    await fixture.listeners.get("change")?.[0]?.({ target: {} });

    preferences.init({ music: false, soundEffects: false });
    const defaultDependencyController = createExplorerAudioController();
    assert.equal(typeof defaultDependencyController.bindAudioInteractions, "function");

    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    Reflect.deleteProperty(globalThis, "document");
    const noDocumentCalls: Array<Promise<unknown[]>> = [];
    createExplorerAudioController({
      createExplorerAudioEngine() {
        noDocumentCalls.push(
          Promise.all([
            Promise.resolve("engine-options"),
            Promise.resolve(audioHelpers.isMusicalDialogOpen()),
            audioHelpers.isMusicEnabled(),
            audioHelpers.isSoundEffectsEnabled(),
          ]),
        );
        return engine;
      },
    });
    assert.deepEqual(await noDocumentCalls[0], [
      "engine-options",
      false,
      false,
      true,
    ]);
    assert.doesNotThrow(() => defaultDependencyController.bindAudioInteractions());
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    }
  });

  afterEach(() => {
    preferenceWindow.restore();
    fixture.restore();
  });
});
