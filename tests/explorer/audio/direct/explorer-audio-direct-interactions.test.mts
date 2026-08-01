import assert from "node:assert/strict";
import { createExplorerAudioController } from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  FakeElement,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";
import {
  assertHasInteraction,
  createAudioTargets,
  createWrappedPreferenceTarget,
} from "./explorer-audio-direct-targets.mjs";

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
  )?.[1] as {
    theme?: () => string;
    helpDialogOpen?: () => boolean;
    savedDialogOpen?: () => boolean;
    retroMode?: () => boolean;
  };
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

  const {
    ariaDisabledTarget,
    buttonTarget,
    checkboxInputTarget,
    checkboxTarget,
    disabledTarget,
    dropdownTarget,
    genericTarget,
    linkTarget,
    radioInputTarget,
    radioTarget,
    roleButtonTarget,
    roleLinkTarget,
    selectTarget,
    switchTarget,
  } = createAudioTargets();

  fixture.listeners.get("click")?.[0]?.({ target: buttonTarget });
  fixture.listeners.get("click")?.[0]?.({ target: checkboxTarget });
  fixture.listeners.get("click")?.[0]?.({ target: radioTarget });
  fixture.listeners.get("click")?.[0]?.({ target: linkTarget });
  fixture.listeners.get("click")?.[0]?.({ target: roleButtonTarget });
  fixture.listeners.get("click")?.[0]?.({ target: roleLinkTarget });
  fixture.listeners.get("click")?.[0]?.({ target: dropdownTarget });
  fixture.listeners.get("click")?.[0]?.({ target: selectTarget });
  fixture.listeners.get("click")?.[0]?.({ target: {} });
  fixture.listeners.get("click")?.[0]?.({ target: disabledTarget });
  fixture.listeners.get("click")?.[0]?.({ target: ariaDisabledTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target: buttonTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target: buttonTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target: {} });
  fixture.listeners.get("pointerover")?.[0]?.({ target: disabledTarget });
  fixture.listeners.get("pointerover")?.[0]?.({ target: ariaDisabledTarget });
  fixture.listeners.get("pointerout")?.[0]?.({
    target: buttonTarget,
    relatedTarget: buttonTarget.closestResult,
  });
  fixture.listeners.get("pointerout")?.[0]?.({
    target: buttonTarget,
    relatedTarget: null,
  });
  fixture.listeners.get("pointerout")?.[0]?.({ target: {}, relatedTarget: null });

  assertHasInteraction(engineCalls, "button", "click");
  assertHasInteraction(engineCalls, "checkbox", "click");
  assertHasInteraction(engineCalls, "radio", "click");
  assertHasInteraction(engineCalls, "link", "click");
  fixture.listeners.get("change")?.[0]?.({ target: switchTarget });
  const wrappedSoundPreference = createWrappedPreferenceTarget(
    "soundEffects",
    true,
  );
  fixture.listeners.get("change")?.[0]?.({ target: wrappedSoundPreference });
  const wrappedMusicPreference = createWrappedPreferenceTarget("music", false);
  fixture.listeners.get("change")?.[0]?.({ target: wrappedMusicPreference });
  const nonElementClosest = new FakeElement([], null);
  nonElementClosest.closest = () => ({}) as any;
  fixture.listeners.get("click")?.[0]?.({ target: nonElementClosest });
  fixture.listeners.get("focusin")?.[0]?.({ target: genericTarget });
  fixture.listeners.get("focusout")?.[0]?.({ target: radioInputTarget });
  fixture.listeners.get("keydown")?.[1]?.({ target: checkboxInputTarget });
  assertHasInteraction(engineCalls, "checkbox", "uncheck");
  assert.equal(
    engineCalls.filter(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length,
    1,
  );
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "checkbox" &&
        call[2] === "check",
    ),
    true,
  );
  assertHasInteraction(engineCalls, "dropdown", "click");
  assertHasInteraction(engineCalls, "generic", "focus");
  assertHasInteraction(engineCalls, "radio", "blur");
  assertHasInteraction(engineCalls, "checkbox", "keydown");

  (globalThis.document as any).hidden = true;
  fixture.listeners.get("visibilitychange")?.[0]?.();
  (globalThis.document as any).hidden = false;
  fixture.listeners.get("visibilitychange")?.[0]?.();
  assert.equal(engineCalls.some((call) => call[0] === "stopMusic"), true);
  assert.equal(engineCalls.some((call) => call[0] === "syncHelpMusic"), true);

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  fixture.helpDialog.open = true;
  fixture.savedDialog.open = false;
  assert.equal(engineOptions.helpDialogOpen?.(), true);
  assert.equal(engineOptions.savedDialogOpen?.(), false);
  assert.equal(engineOptions.retroMode?.(), true);
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
      attributeName: "class",
      target: (globalThis.document as any).documentElement,
    },
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
