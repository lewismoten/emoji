import assert from "node:assert/strict";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  FakeElement,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";

const fixture = installAudioDomFixture();

try {
  const dependencies = createExplorerAudioDependencies();
  assert.equal(typeof dependencies.createExplorerAudioEngine, "function");

  const engineCalls: Array<unknown[]> = [];
  const engine = createAudioEngineFixture(engineCalls);
  const state = {
    explorerPreferences: { music: false, soundEffects: false },
  };
  const controller = createExplorerAudioController(
    {
      savePreference() {},
      state: () => state,
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
  assert.equal(typeof fixture.listeners.get("pointerdown")?.[0], "function");
  assert.equal(typeof fixture.listeners.get("keydown")?.[0], "function");

  const themeObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any)?.attributeFilter[0] === "data-theme",
  )!;
  themeObserver.callback?.([{ type: "attributes", attributeName: "class" }]);

  state.explorerPreferences.music = true;
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  await Promise.resolve();
  assert.equal(engineCalls.some((call) => call[0] === "resumeAudioContext"), true);
  assert.equal(engineCalls.some((call) => call[0] === "restartMusic"), true);

  (globalThis.document as any).documentElement.dataset.theme = "base";
  fixture.musicToggle.checked = false;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.equal(engineCalls.some((call) => call[0] === "syncHelpMusic"), true);
  assert.equal(fixture.musicToggle.disabled, true);

  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
  assert.equal(fixture.soundToggle.disabled, true);

  const dialogObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any)?.attributeFilter[0] === "open",
  )!;
  const exampleDialog = new FakeElement([fixture.dialogSelector]);
  exampleDialog.classList.values.add("example-dialog");
  exampleDialog.open = true;
  dialogObserver.callback?.([{ target: exampleDialog }]);
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "open",
    ),
    true,
  );

  const textTarget = new FakeElement([], null);
  textTarget.tagName = "DIV";
  const textEventTarget = new FakeElement([], textTarget);
  const checkboxRadioInteractionCount = engineCalls.filter(
    (call) =>
      call[0] === "playInteraction" &&
      (call[1] === "checkbox" || call[1] === "radio") &&
      (call[2] === "check" || call[2] === "uncheck"),
  ).length;
  fixture.listeners.get("change")?.[0]?.({ target: textEventTarget });
  assert.equal(
    engineCalls.filter(
      (call) =>
        call[0] === "playInteraction" &&
        (call[1] === "checkbox" || call[1] === "radio") &&
        (call[2] === "check" || call[2] === "uncheck"),
    ).length,
    checkboxRadioInteractionCount,
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

  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Reflect.deleteProperty(globalThis, "document");
  const documentlessController = createExplorerAudioController(
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
  assert.doesNotThrow(() => documentlessController.bindAudioInteractions());
  assert.doesNotThrow(() => documentlessController.renderSoundEffectsToggle());
  assert.doesNotThrow(() => documentlessController.renderMusicToggle());
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  }

  fixture.setDocument({
    ...globalThis.document,
    body: null,
    documentElement: null,
  });
  const documentElementlessController = createExplorerAudioController(
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
  assert.doesNotThrow(() => documentElementlessController.bindAudioInteractions());
} finally {
  fixture.restore();
}
