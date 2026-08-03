import assert from "node:assert/strict";
import {
  FakeElement,
  installExplorerAudioDomFixture,
  loadExplorerAudioModuleFixture,
} from "./explorer-audio-module-fixture.mjs";

const fixture = installExplorerAudioDomFixture();
const { module, preferencesStub } = await loadExplorerAudioModuleFixture();

try {
  preferencesStub.init({ music: true, soundEffects: false });

  const directEngineCalls: any[][] = [];
  let directEngineOptions: any;
  const directController = module.createExplorerAudioController({
    createExplorerAudioEngine(options: any) {
      directEngineOptions = options;
      return {
        musicEnabled: () => false,
        playInteraction(element: string, action: string) {
          directEngineCalls.push(["playInteraction", element, action]);
        },
        resumeAudioContext() {
          directEngineCalls.push(["resumeAudioContext"]);
          return Promise.resolve();
        },
        soundEffectsEnabled: () => true,
        stopMusic() {
          directEngineCalls.push(["stopMusic"]);
        },
        syncHelpMusic() {
          directEngineCalls.push(["syncHelpMusic"]);
        },
        restartMusic() {
          directEngineCalls.push(["restartMusic"]);
        },
      } as any;
    },
  } as any);

  directController.bindAudioInteractions();
  assert.equal(directEngineOptions.soundEffectsEnabled(), false);
  assert.equal(directEngineOptions.musicEnabled(), true);
  assert.equal(directEngineOptions.isMusicalDialogOpen(), true);
  assert.equal(directEngineOptions.retroMode(), true);
  assert.equal(directEngineOptions.theme(), "retro");

  const directClick = fixture.listeners.get("click")?.at(-1)!;
  const directChange = fixture.listeners.get("change")?.at(-1)!;
  const directFocusIn = fixture.listeners.get("focusin")?.at(-1)!;
  const directFocusOut = fixture.listeners.get("focusout")?.at(-1)!;
  const directKeyDown = fixture.listeners.get("keydown")?.at(-1)!;

  const listboxInteractive = new FakeElement([], null);
  listboxInteractive.attributes.set("aria-haspopup", "listbox");
  directClick({ target: new FakeElement([], listboxInteractive) });

  const roleRadioInteractive = new FakeElement([], null);
  roleRadioInteractive.attributes.set("role", "radio");
  roleRadioInteractive.attributes.set("aria-checked", "true");
  directChange({ target: new FakeElement([], roleRadioInteractive) });

  const roleLinkInteractive = new FakeElement([], null);
  roleLinkInteractive.attributes.set("role", "link");
  directFocusIn({ target: new FakeElement([], roleLinkInteractive) });
  directFocusOut({ target: new FakeElement([], roleLinkInteractive) });
  directKeyDown({ target: new FakeElement([], roleLinkInteractive) });

  const checkboxInteractive = new FakeElement([], null);
  checkboxInteractive.tagName = "INPUT";
  checkboxInteractive.type = "checkbox";
  checkboxInteractive.checked = true;
  directChange({ target: new FakeElement([], checkboxInteractive) });

  const switchInteractive = new FakeElement([], null);
  switchInteractive.attributes.set("role", "switch");
  switchInteractive.attributes.set("aria-checked", "false");
  directChange({ target: new FakeElement([], switchInteractive) });

  const buttonRoleInteractive = new FakeElement([], null);
  buttonRoleInteractive.attributes.set("role", "button");
  directClick({ target: new FakeElement([], buttonRoleInteractive) });

  const genericDirectInteractive = new FakeElement([], null);
  directClick({ target: new FakeElement([], genericDirectInteractive) });

  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dropdown" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "radio" &&
        call[2] === "check",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "focus",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "blur",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "keydown",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "checkbox" &&
        call[2] === "check",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "checkbox" &&
        call[2] === "uncheck",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "generic" &&
        call[2] === "click",
    ),
    true,
  );
} finally {
  fixture.restore();
}
