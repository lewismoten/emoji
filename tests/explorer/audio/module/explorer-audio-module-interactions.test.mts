import assert from "node:assert/strict";
import {
  FakeElement,
  installExplorerAudioDomFixture,
  loadExplorerAudioModuleFixture,
} from "./explorer-audio-module-fixture.mjs";

const fixture = installExplorerAudioDomFixture();
const { dialogListenersStub, engineStub, module, preferencesStub } =
  await loadExplorerAudioModuleFixture();

try {
  preferencesStub.init({ music: true, soundEffects: false });
  const controller = module.createExplorerAudioController();

  controller.bindAudioInteractions();
  controller.bindAudioInteractions();
  const themeObserver = fixture.observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any).attributeFilter[0] === "data-theme",
  )!;
  assert.equal(dialogListenersStub.listenerCalls.length, 1);
  assert.equal(dialogListenersStub.listenerCalls[0]?.[0], "add");
  assert.equal(fixture.observers.length, 1);
  assert.equal(
    themeObserver?.target,
    (globalThis.document as any).documentElement,
  );
  assert.deepEqual(themeObserver?.options, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  engineStub.engineApi.soundEffectsEnabled = () => true;
  fixture.listeners.get("pointerdown")?.[0]();
  fixture.listeners.get("keydown")?.[0]();
  assert.equal(
    engineStub.engineCalls.filter(
      (call: any[]) => call[0] === "resumeAudioContext",
    ).length >= 2,
    true,
  );

  const interactive = new FakeElement([], null);
  interactive.tagName = "BUTTON";
  const target = new FakeElement([], interactive);
  fixture.listeners.get("click")?.[0]({ target });
  fixture.listeners.get("pointerover")?.[0]({ target });
  fixture.listeners.get("pointerover")?.[0]({ target });
  fixture.listeners.get("pointerout")?.[0]({ target, relatedTarget: null });
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.filter(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length,
    1,
  );

  const selectInteractive = new FakeElement([], null);
  selectInteractive.tagName = "SELECT";
  fixture.listeners.get("click")?.[0]({
    target: new FakeElement([], selectInteractive),
  });
  const radioInteractive = new FakeElement([], null);
  radioInteractive.tagName = "INPUT";
  radioInteractive.type = "radio";
  radioInteractive.checked = true;
  fixture.listeners.get("change")?.[0]({
    target: new FakeElement([], radioInteractive),
  });
  const linkInteractive = new FakeElement([], null);
  linkInteractive.tagName = "A";
  fixture.listeners.get("focusin")?.[0]({
    target: new FakeElement([], linkInteractive),
  });
  fixture.listeners.get("focusout")?.[0]({
    target: new FakeElement([], linkInteractive),
  });
  fixture.listeners.get("keydown")?.[1]({
    target: new FakeElement([], linkInteractive),
  });
  const genericInteractive = new FakeElement([], null);
  fixture.listeners.get("click")?.[0]({
    target: new FakeElement([], genericInteractive),
  });
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "dropdown" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "radio" &&
        call[2] === "check",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "focus",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "blur",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "keydown",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "generic" &&
        call[2] === "click",
    ),
    true,
  );

  (globalThis.document as any).hidden = true;
  fixture.listeners.get("visibilitychange")?.[0]();
  (globalThis.document as any).hidden = false;
  fixture.listeners.get("visibilitychange")?.[0]();
  assert.equal(
    engineStub.engineCalls.some((call: any[]) => call[0] === "stopMusic"),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some((call: any[]) => call[0] === "syncHelpMusic"),
    true,
  );

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  const dialogListener = dialogListenersStub.listenerCalls[0]?.[1] as
    | ((action: "open" | "close", dialog: FakeElement) => void)
    | undefined;
  dialogListener?.("open", otherDialog);
  dialogListener?.("open", fixture.helpDialog);
  dialogListener?.("close", fixture.savedDialog);
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "open",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
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
  assert.equal(
    engineStub.engineCalls.some((call: any[]) => call[0] === "restartMusic"),
    true,
  );
  assert.equal(
    engineStub.engineCalls.filter((call: any[]) => call[0] === "syncHelpMusic")
      .length >= 1,
    true,
  );

  controller.syncHelpMusic();
  assert.equal(
    engineStub.engineCalls.filter((call: any[]) => call[0] === "syncHelpMusic")
      .length >= 3,
    true,
  );
} finally {
  fixture.restore();
}
