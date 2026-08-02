import assert from "node:assert/strict";
import { createExplorerAudioController } from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  FakeElement,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";

const fixture = installAudioDomFixture();

try {
  const engineCalls: Array<unknown[]> = [];
  const engine = createAudioEngineFixture(engineCalls);
  const controller = createExplorerAudioController(
    {
      savePreference() {},
      state: () => ({
        explorerPreferences: { music: false, soundEffects: false },
      }),
    },
    {
      createExplorerAudioEngine() {
        return engine;
      },
    },
  );

  controller.bindAudioInteractions();

  fixture.listeners.get("pointerdown")?.[0]?.();
  fixture.listeners.get("keydown")?.[0]?.();
  assert.equal(
    engineCalls.some((call) => call[0] === "resumeAudioContext"),
    false,
  );

  const themeObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any)?.attributeFilter[0] === "data-theme",
  )!;
  themeObserver.callback?.([{ type: "attributes", attributeName: "class" }]);
  assert.equal(engineCalls.some((call) => call[0] === "restartMusic"), false);

  const textTarget = new FakeElement([], null);
  textTarget.tagName = "DIV";
  const textEventTarget = new FakeElement([], textTarget);
  fixture.listeners.get("change")?.[0]?.({ target: textEventTarget });
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        (call[1] === "checkbox" || call[1] === "radio") &&
        (call[2] === "check" || call[2] === "uncheck"),
    ),
    false,
  );

  const persistentHoverTarget = new FakeElement([], null);
  persistentHoverTarget.tagName = "BUTTON";
  const hoverEventTarget = new FakeElement([], persistentHoverTarget);
  persistentHoverTarget.contains = (target: unknown) => target === hoverEventTarget;
  fixture.listeners.get("pointerover")?.[0]?.({ target: hoverEventTarget });
  const hoverCount = engineCalls.filter(
    (call) => call[0] === "playInteraction" && call[2] === "hover",
  ).length;
  fixture.listeners.get("pointerout")?.[0]?.({
    target: hoverEventTarget,
    relatedTarget: hoverEventTarget,
  });
  fixture.listeners.get("pointerover")?.[0]?.({ target: hoverEventTarget });
  assert.equal(
    engineCalls.filter(
      (call) => call[0] === "playInteraction" && call[2] === "hover",
    ).length,
    hoverCount,
  );

  fixture.setDocument({
    ...globalThis.document,
    querySelector() {
      return null;
    },
  });
  assert.doesNotThrow(() => controller.renderSoundEffectsToggle());
  assert.doesNotThrow(() => controller.renderMusicToggle());
} finally {
  fixture.restore();
}
