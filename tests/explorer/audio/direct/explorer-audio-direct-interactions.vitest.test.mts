import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import * as preferences from "../../../../src/preferences.js";
import { createExplorerAudioController } from "../../../../src/explorer-audio.js";
import {
  createAudioEngineFixture,
  FakeElement,
  installPreferenceWindow,
  installAudioDomFixture,
} from "./explorer-audio-direct-fixture.mjs";
import {
  assertHasInteraction,
  createAudioTargets,
  createWrappedPreferenceTarget,
} from "./explorer-audio-direct-targets.mjs";

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("explorer-audio-direct-interactions", () => {
  const fixture = installAudioDomFixture();
  const preferenceWindow = installPreferenceWindow({
    music: true,
    soundEffects: false,
  });

  afterEach(() => {
    preferences.init({});
  });

  it("covers direct controller interactions", async () => {
    preferences.init({});
    const engineCalls: Array<unknown[]> = [];
    const engine = createAudioEngineFixture(engineCalls);
    const controller = createExplorerAudioController({
      createExplorerAudioEngine() {
        engineCalls.push(["createExplorerAudioEngine"]);
        return engine;
      },
    });

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
    assert.equal(fixture.observers.length >= 2, true);
    assert.equal(themeObserver?.target, (globalThis.document as any).documentElement);
    assert.deepEqual(themeObserver?.options, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    assert.equal(
      engineCalls.some((call) => call[0] === "createExplorerAudioEngine"),
      true,
    );

    preferences.setBoolean("music", false);
    preferences.setBoolean("soundEffects", true);
    await fixture.listeners.get("pointerdown")?.[0]?.();
    await fixture.listeners.get("keydown")?.[0]?.();
    assert.equal(
      engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 2,
      true,
    );

    preferences.setBoolean("soundEffects", false);
    preferences.setBoolean("music", true);
    await fixture.listeners.get("pointerdown")?.[0]?.();
    assert.equal(
      engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 3,
      true,
    );
    preferences.setBoolean("music", false);
    const resumeCountBeforeDisabledPrepare = engineCalls.filter(
      (call) => call[0] === "resumeAudioContext",
    ).length;
    await fixture.listeners.get("pointerdown")?.[0]?.();
    await fixture.listeners.get("keydown")?.[0]?.();
    assert.equal(
      engineCalls.filter((call) => call[0] === "resumeAudioContext").length,
      resumeCountBeforeDisabledPrepare,
    );

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
    await fixture.listeners.get("change")?.[0]?.({ target: switchTarget });
    await fixture.listeners.get("change")?.[0]?.({ target: checkboxInputTarget });
    await fixture.listeners
      .get("change")
      ?.at(0)?.({ target: createWrappedPreferenceTarget("soundEffects", true) });
    await fixture.listeners
      .get("change")
      ?.at(0)?.({ target: createWrappedPreferenceTarget("music", false) });
    await flush();
    const nonElementClosest = new FakeElement([], null);
    nonElementClosest.closest = () => ({}) as any;
    fixture.listeners.get("click")?.[0]?.({ target: nonElementClosest });
    const noTagInteractive = new FakeElement([], null);
    (noTagInteractive as any).tagName = undefined;
    fixture.listeners.get("click")?.[0]?.({
      target: new FakeElement([], noTagInteractive),
    });
    fixture.listeners.get("focusin")?.[0]?.({ target: genericTarget });
    fixture.listeners.get("focusout")?.[0]?.({ target: radioInputTarget });
    fixture.listeners.get("keydown")?.[1]?.({ target: checkboxInputTarget });
    fixture.listeners.get("keydown")?.[1]?.({ target: "not-an-element" });
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
    assert.equal(
      engineCalls.filter((call) => call[0] === "syncHelpMusic").length >= 3,
      true,
    );
    const hoverCountBeforeReset = engineCalls.filter(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length;
    fixture.listeners.get("pointerover")?.[0]?.({ target: buttonTarget });
    fixture.listeners.get("pointerout")?.[0]?.({
      target: buttonTarget,
      relatedTarget: null,
    });
    fixture.listeners.get("pointerover")?.[0]?.({ target: buttonTarget });
    assert.equal(
      engineCalls.filter(
        (call) =>
          call[0] === "playInteraction" &&
          call[1] === "button" &&
          call[2] === "hover",
      ).length,
      hoverCountBeforeReset + 2,
    );

    await themeObserver?.callback([
      {
        type: "attributes",
        attributeName: "class",
        target: (globalThis.document as any).documentElement,
      },
    ]);
  });

  afterEach(() => {
    preferenceWindow.restore();
    fixture.restore();
  });
});
