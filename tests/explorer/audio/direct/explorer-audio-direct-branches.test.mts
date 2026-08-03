import assert from "node:assert/strict";
import * as preferences from "../../../../src/preferences.js";
import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  FakeElement,
  installPreferenceWindow,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";
import {
  createAudioTargets,
  createWrappedPreferenceTarget,
} from "./explorer-audio-direct-targets.mjs";

const fixture = installAudioDomFixture();
const preferenceWindow = installPreferenceWindow({
  music: false,
  soundEffects: false,
});

try {
  preferences.init({});
  const dependencies = createExplorerAudioDependencies();
  assert.equal(typeof dependencies.createExplorerAudioEngine, "function");
  assert.doesNotThrow(() =>
    createExplorerAudioController(undefined),
  );

  const engineCalls: Array<unknown[]> = [];
  const engine = createAudioEngineFixture(engineCalls);
  const toggleParent = new FakeElement([], null);
  (fixture.soundToggle as any).parentElement = toggleParent;
  (fixture.musicToggle as any).parentElement = toggleParent;
  const controller = createExplorerAudioController({
    createExplorerAudioEngine() {
      return engine;
    },
  });

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

  preferences.setBoolean("music", true);
  fixture.musicToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  await Promise.resolve();
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
  assert.equal(toggleParent.attributes.get("aria-pressed"), "false");
  assert.equal(toggleParent.attributes.get("aria-disabled"), "true");

  (globalThis.document as any).documentElement.dataset.theme = "retro";
  fixture.soundToggle.checked = false;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
  fixture.soundToggle.checked = true;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.soundToggle });
  assert.equal(toggleParent.attributes.get("aria-pressed"), "true");
  assert.equal(toggleParent.attributes.get("aria-disabled"), "false");
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 2,
    true,
  );

  preferences.setBoolean("music", false);
  fixture.musicToggle.checked = false;
  fixture.listeners.get("change")?.[0]?.({ target: fixture.musicToggle });
  assert.equal(
    engineCalls.filter((call) => call[0] === "syncHelpMusic").length >= 2,
    true,
  );

  const dialogObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any)?.attributeFilter[0] === "open",
  )!;
  const exampleDialog = new FakeElement([fixture.dialogSelector, ".dialog"]);
  exampleDialog.classList.values.add("dialog");
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
  fixture.helpDialog.open = false;
  fixture.savedDialog.open = true;
  const createdOptions = dependencies.createExplorerAudioEngine({
    retroMode: () => false,
    theme: () => "dark" as any,
  });
  assert.equal(typeof createdOptions.playInteraction, "function");

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

  const {
    buttonTarget,
    genericTarget,
    linkTarget,
    radioTarget,
    checkboxInputTarget,
    checkboxTarget,
    radioInputTarget,
    roleLinkTarget,
    selectTarget,
  } = createAudioTargets();
  fixture.listeners.get("click")?.[0]?.({ target: buttonTarget });
  fixture.listeners.get("click")?.[0]?.({ target: linkTarget });
  fixture.listeners.get("click")?.[0]?.({ target: roleLinkTarget });
  fixture.listeners.get("click")?.[0]?.({ target: selectTarget });
  fixture.listeners.get("focusin")?.[0]?.({ target: genericTarget });
  fixture.listeners.get("focusout")?.[0]?.({ target: radioInputTarget });
  fixture.listeners.get("change")?.[0]?.({ target: checkboxInputTarget });
  fixture.listeners.get("change")?.[0]?.({ target: radioTarget });
  fixture.listeners.get("change")?.[0]?.({ target: checkboxTarget });
  const checkedRoleRadioInteractive = new FakeElement([], null);
  checkedRoleRadioInteractive.tagName = "DIV";
  checkedRoleRadioInteractive.checked = true;
  checkedRoleRadioInteractive.setAttribute("role", "radio");
  fixture.listeners.get("change")?.[0]?.({
    target: new FakeElement([], checkedRoleRadioInteractive),
  });
  fixture.listeners.get("change")?.[0]?.({ target: createWrappedPreferenceTarget("soundEffects", true) });
  fixture.listeners.get("change")?.[0]?.({ target: createWrappedPreferenceTarget("music", false) });
  const nonElementInteractive = { target: "not-an-element" };
  fixture.listeners.get("change")?.[0]?.(nonElementInteractive);
  fixture.listeners.get("click")?.[0]?.(nonElementInteractive);
  fixture.listeners.get("focusin")?.[0]?.(nonElementInteractive);
  const closestWithoutHtml = new FakeElement([], null);
  closestWithoutHtml.closest = () => ({}) as any;
  fixture.listeners.get("click")?.[0]?.({ target: closestWithoutHtml });
  const noParentController = createExplorerAudioController({
    createExplorerAudioEngine() {
      return engine;
    },
  });
  (fixture.soundToggle as any).parentElement = null;
  (fixture.musicToggle as any).parentElement = null;
  assert.doesNotThrow(() => noParentController.renderSoundEffectsToggle());
  assert.doesNotThrow(() => noParentController.renderMusicToggle());

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
  const documentlessController = createExplorerAudioController({
    createExplorerAudioEngine() {
      return engine;
    },
  });
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
  const documentElementlessController = createExplorerAudioController({
    createExplorerAudioEngine() {
      return engine;
    },
  });
  assert.doesNotThrow(() => documentElementlessController.bindAudioInteractions());
} finally {
  preferenceWindow.restore();
  fixture.restore();
}
