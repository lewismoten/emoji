import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";
import * as dialogListeners from "./controls/dialog/dialog-listeners.js";
import type { ExplorerAudioAction } from "./explorer/audio/explorer-audio-types.js";
import documentRef, { addEventListener } from "./utils/document.js";
import * as aria from "./utils/aria.js";
import * as audioHelpers from "./explorer/audio/audio-helpers.js";
import { classifyElement, isInput } from "./utils/element.js";
import * as audioToggle from "./controls/audio/audio-toggle.js";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "select",
  "input",
  "label",
  "[tabindex]",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="switch"]',
  '[aria-haspopup="listbox"]',
  ".modifier-filter-option",
  ".setting-choice",
  ".theme-choice",
  ".mode-choice",
  ".audio-choice",
  ".emoji-font-choice",
  ".language-option",
  ".saved-picker",
  ".help-picker",
  ".order-mode",
  ".compact-choice",
  ".version-mode-toggle",
  ".version-step",
  ".filter-picker-trigger",
  "[data-emoji-key]",
].join(", ");

export const createExplorerAudioDependencies = () => ({
  createExplorerAudioEngine,
});

export function createExplorerAudioController(
  dependencies?: ReturnType<typeof createExplorerAudioDependencies>,
) {
  const helpers = dependencies ?? createExplorerAudioDependencies();
  let initialized = false;
  let themeObserver: MutationObserver | undefined;
  let hoverTarget: HTMLElement | null = null;

  const audio = helpers.createExplorerAudioEngine();

  const playTargetAction = (target: HTMLElement, action: ExplorerAudioAction) =>
    audio.playInteraction(classifyElement(target), action);

  const setSoundEffects = async (enabled: boolean) => {
    if (await audioToggle.enableSoundEffects(enabled)) {
      await audio.resumeAudioContext();
    }
  };

  const setMusic = async (enabled: boolean) => {
    if (await audioToggle.enableMusic(enabled)) {
      await audio.resumeAudioContext();
      await audio.restartMusic();
      return;
    }
    await audio.syncHelpMusic();
  };

  const getInteractiveTarget = (
    target: EventTarget | null,
  ): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!(interactive instanceof HTMLElement)) return null;
    if ("disabled" in interactive && interactive.disabled) return null;
    if (aria.isDisabled(interactive)) return null;
    return interactive;
  };

  function bindAudioInteractions() {
    if (initialized) return;
    const activeDocument = documentRef();
    if (!activeDocument) return;
    initialized = true;

    const prepareAudio = async () => {
      const enabled = await audioHelpers.isAudioEnabled();
      return enabled && audio.resumeAudioContext();
    };
    addEventListener("pointerdown", prepareAudio, {
      capture: true,
      passive: true,
    });
    addEventListener("keydown", prepareAudio, { capture: true });

    addEventListener(
      "change",
      async (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (
          target.matches('.audio-choice-input[value="soundEffects"]') ||
          target
            .closest?.("[data-audio-preference]")
            ?.matches?.('[data-audio-preference="soundEffects"]')
        ) {
          const input = target as HTMLInputElement;
          await setSoundEffects(input.checked);
          return playTargetAction(
            target as HTMLElement,
            input.checked ? "check" : "uncheck",
          );
        }
        if (
          target.matches('.audio-choice-input[value="music"]') ||
          target
            .closest?.("[data-audio-preference]")
            ?.matches?.('[data-audio-preference="music"]')
        ) {
          const input = target as HTMLInputElement;
          await setMusic(input.checked);
          return playTargetAction(
            target as HTMLElement,
            input.checked ? "check" : "uncheck",
          );
        }
        if (!(target instanceof HTMLElement)) return;
        const interactive = getInteractiveTarget(target);
        if (!interactive) return;
        const type = classifyElement(interactive);
        if (type !== "checkbox" && type !== "radio") return;
        const checked = isInput(interactive)
          ? interactive.checked
          : aria.isChecked(interactive);
        audio.playInteraction(type, checked ? "check" : "uncheck");
      },
      true,
    );

    addEventListener(
      "click",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "click");
      },
      true,
    );
    addEventListener(
      "pointerover",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target === hoverTarget) return;
        hoverTarget = target;
        playTargetAction(target, "hover");
      },
      true,
    );
    addEventListener(
      "pointerout",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target !== hoverTarget) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Element && target.contains(relatedTarget))
          return;
        hoverTarget = null;
      },
      true,
    );
    type EventActionPair = [keyof DocumentEventMap, ExplorerAudioAction];
    [
      ["focusin", "focus"] as EventActionPair,
      ["focusout", "blur"] as EventActionPair,
      ["keydown", "keydown"] as EventActionPair,
    ].forEach(([eventName, action]: EventActionPair) =>
      addEventListener(
        eventName,
        (event) => {
          const target = getInteractiveTarget(event.target);
          if (target) playTargetAction(target, action as ExplorerAudioAction);
        },
        true,
      ),
    );

    addEventListener("visibilitychange", () => {
      if (activeDocument.hidden) audio.stopMusic();
      else audio.syncHelpMusic();
    });

    dialogListeners.add((action, dialog) => {
      audio.playInteraction("dialog", action);
      if (dialog.classList.contains("musical")) audio.syncHelpMusic();
    });

    themeObserver = new MutationObserver(async (records) => {
      if (
        !records.some(
          (record) =>
            record.type === "attributes" &&
            record.attributeName === "data-theme",
        )
      )
        return;
      await audioToggle.render();
      await audio.restartMusic();
    });
    if (activeDocument.documentElement) {
      themeObserver.observe(activeDocument.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    audioToggle.render();
    audio.syncHelpMusic();
  }

  return {
    bindAudioInteractions,
    syncHelpMusic: audio.syncHelpMusic,
  };
}
