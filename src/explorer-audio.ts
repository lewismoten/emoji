import * as preferences from "./preferences.js";
import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";
import * as dialogListeners from "./controls/dialog/dialog-listeners.js";
import type { ExplorerAudioAction } from "./explorer/audio/explorer-audio-types.js";
import documentRef, { addEventListener } from "./utils/document.js";
import { isBaseTheme, canThemeSupportAudio } from "./utils/themes.js";
import * as aria from "./utils/aria.js";
import * as audioHelpers from "./explorer/audio/audio-helpers.js";
import { classifyElement, isInput } from "./utils/element.js";

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
  const renderAudioToggle = (
    toggle: HTMLInputElement | null,
    enabled: boolean,
  ) => {
    if (!toggle) return;
    const audioDisabled = !canThemeSupportAudio();
    toggle.checked = enabled;
    toggle.disabled = audioDisabled;
    aria.setChecked(toggle, enabled);
    aria.setDisabled(toggle, audioDisabled);
    if (!toggle.parentElement) return;
    aria.setPressed(toggle.parentElement, enabled);
    aria.setDisabled(toggle.parentElement, audioDisabled);
  };
  const renderSoundEffectsToggle = () =>
    renderAudioToggle(
      audioHelpers.soundEffectsToggle(),
      audioHelpers.isSoundEffectsEnabled(),
    );
  const renderMusicToggle = () =>
    renderAudioToggle(
      audioHelpers.musicToggle(),
      audioHelpers.isMusicEnabled(),
    );

  function setSoundEffects(enabled: boolean) {
    if (isBaseTheme()) return void renderSoundEffectsToggle();
    preferences.setBoolean("soundEffects", enabled);
    renderSoundEffectsToggle();
    if (enabled) void audio.resumeAudioContext();
  }

  function setMusic(enabled: boolean) {
    if (isBaseTheme()) {
      renderMusicToggle();
      return void audio.syncHelpMusic();
    }
    preferences.setBoolean("music", enabled);
    renderMusicToggle();
    if (enabled) {
      void audio.resumeAudioContext().then(() => {
        audio.restartMusic();
      });
      return;
    }
    audio.syncHelpMusic();
  }

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

    const prepareAudio = () =>
      audioHelpers.isAudioEnabled() && audio.resumeAudioContext();
    addEventListener("pointerdown", prepareAudio, {
      capture: true,
      passive: true,
    });
    addEventListener("keydown", prepareAudio, { capture: true });

    addEventListener(
      "change",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (
          target.matches('.audio-choice-input[value="soundEffects"]') ||
          target
            .closest?.("[data-audio-preference]")
            ?.matches?.('[data-audio-preference="soundEffects"]')
        ) {
          const input = target as HTMLInputElement;
          setSoundEffects(input.checked);
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
          setMusic(input.checked);
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

    themeObserver = new MutationObserver((records) => {
      if (
        !records.some(
          (record) =>
            record.type === "attributes" &&
            record.attributeName === "data-theme",
        )
      )
        return;
      renderSoundEffectsToggle();
      renderMusicToggle();
      audio.restartMusic();
    });
    if (activeDocument.documentElement) {
      themeObserver.observe(activeDocument.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    renderSoundEffectsToggle();
    renderMusicToggle();
    audio.syncHelpMusic();
  }

  return {
    bindAudioInteractions,
    renderMusicToggle,
    renderSoundEffectsToggle,
    syncHelpMusic: audio.syncHelpMusic,
  };
}
