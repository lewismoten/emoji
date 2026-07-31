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
        explorerPreferences: { music: true, soundEffects: false },
      }),
    },
    {
      createExplorerAudioEngine(options: unknown) {
        engineCalls.push(["createExplorerAudioEngine", options]);
        return engine;
      },
    },
  );

  controller.bindAudioInteractions();
  controller.bindAudioInteractions();

  const dialogObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any).attributeFilter[0] === "open",
  )!;
  const themeObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any).attributeFilter[0] === "data-theme",
  )!;

  assert.equal(dialogObserver?.target, fixture.body);
  assert.deepEqual(dialogObserver?.options, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });
  assert.equal(fixture.observers.length, 2);
  assert.equal(
    themeObserver?.target,
    (globalThis.document as any).documentElement,
  );
  assert.deepEqual(themeObserver?.options, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const engineOptions = engineCalls.find(
    (call) => call[0] === "createExplorerAudioEngine",
  )?.[1] as { theme?: () => string };
  assert.equal(engineOptions.theme?.(), "retro");

  engine.soundEffectsEnabled = () => true;
  await fixture.listeners.get("pointerdown")?.[0]?.();
  await fixture.listeners.get("keydown")?.[0]?.();
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 2,
    true,
  );

  engine.soundEffectsEnabled = () => false;
  engine.musicEnabled = () => true;
  await fixture.listeners.get("pointerdown")?.[0]?.();
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 3,
    true,
  );
  engine.musicEnabled = () => false;

  const interactive = new FakeElement([], null);
  interactive.tagName = "BUTTON";
  const target = new FakeElement([], interactive);
  const disabledInteractive = new FakeElement([], null);
  disabledInteractive.disabled = true;
  const disabledTarget = new FakeElement([], disabledInteractive);
  const ariaDisabledInteractive = new FakeElement([], null);
  ariaDisabledInteractive.setAttribute("aria-disabled", "true");
  const ariaDisabledTarget = new FakeElement([], ariaDisabledInteractive);

  fixture.listeners.get("click")?.[0]?.({ target });
  fixture.listeners.get("click")?.[0]?.({ target: {} });
  fixture.listeners.get("click")?.[0]?.({ target: disabledTarget });
  fixture.listeners.get("click")?.[0]?.({ target: ariaDisabledTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target });
  fixture.listeners.get("pointerover")?.[0]?.({ target });
  fixture.listeners.get("pointerover")?.[0]?.({ target: {} });
  fixture.listeners.get("pointerover")?.[0]?.({ target: disabledTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target: ariaDisabledTarget });
  fixture.listeners.get("pointerout")?.[0]?.({
    target,
    relatedTarget: interactive,
  });
  fixture.listeners.get("pointerout")?.[0]?.({ target, relatedTarget: null });
  fixture.listeners.get("pointerout")?.[0]?.({ target: {}, relatedTarget: null });

  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineCalls.filter(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length,
    1,
  );

  (globalThis.document as any).hidden = true;
  fixture.listeners.get("visibilitychange")?.[0]?.();
  (globalThis.document as any).hidden = false;
  fixture.listeners.get("visibilitychange")?.[0]?.();
  assert.equal(engineCalls.some((call) => call[0] === "stopMusic"), true);
  assert.equal(engineCalls.some((call) => call[0] === "syncHelpMusic"), true);

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  dialogObserver?.callback([
    { target: {} },
    { target: otherDialog },
    { target: fixture.helpDialog },
    { target: fixture.savedDialog },
  ]);
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "open",
    ),
    true,
  );
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "close",
    ),
    true,
  );

  themeObserver?.callback([
    {
      type: "attributes",
      attributeName: "data-theme",
      target: (globalThis.document as any).documentElement,
    },
  ]);
  assert.equal(engineCalls.some((call) => call[0] === "restartMusic"), true);
  assert.equal(
    engineCalls.filter((call) => call[0] === "syncHelpMusic").length >= 2,
    true,
  );

  fixture.setDocument({
    ...globalThis.document,
    body: null,
  });
  const secondController = createExplorerAudioController(
    {
      savePreference() {},
      state: () => ({ explorerPreferences: {} }),
    },
    {
      createExplorerAudioEngine() {
        return engine;
      },
    },
  );
  secondController.bindAudioInteractions();
} finally {
  fixture.restore();
}
