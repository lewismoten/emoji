type ExplorerAudioOptions = {
  savePreference: (key: string, value: unknown) => void;
  state: () => { explorerPreferences: Record<string, any> };
};

import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";
import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
} from "./explorer/audio/explorer-audio-types.js";

type AudioTarget = HTMLElement;

const INTERACTIVE_SELECTOR =
  'a[href], button, select, input, [role="button"], [role="checkbox"], [role="link"], [role="radio"], [role="switch"], [aria-haspopup="listbox"], .modifier-filter-option';

const DIALOG_SELECTOR =
  ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";

export function createExplorerAudioDependencies() {
  return {
    createExplorerAudioEngine,
  };
}

export function createExplorerAudioController(
  options: ExplorerAudioOptions,
  dependencies?: ReturnType<typeof createExplorerAudioDependencies>,
) {
  const helpers = dependencies ?? createExplorerAudioDependencies();
  let initialized = false;
  let dialogObserver: MutationObserver | undefined;
  let themeObserver: MutationObserver | undefined;
  let hoverTarget: AudioTarget | null = null;

  const preferences = () => options.state().explorerPreferences;
  const retroMode = () => document.documentElement.dataset.theme === "retro";
  const soundEffectsEnabled = () => preferences().soundEffects === true;
  const musicEnabled = () => preferences().music === true;

  const soundEffectsToggle = () =>
    document.querySelector<HTMLInputElement>(".sound-effects-toggle");
  const musicToggle = () =>
    document.querySelector<HTMLInputElement>(".music-toggle");
  const helpDialog = () =>
    document.querySelector<HTMLDialogElement>(".help-dialog");
  const savedDialog = () =>
    document.querySelector<HTMLDialogElement>(".saved-dialog");
  const audio = helpers.createExplorerAudioEngine({
    helpDialogOpen: () => helpDialog()?.open === true,
    musicEnabled,
    retroMode,
    theme: () =>
      (document.documentElement.dataset.theme as
        "base" | "dark" | "light" | "retro") ?? "dark",
    savedDialogOpen: () => savedDialog()?.open === true,
    soundEffectsEnabled,
  });

  function hasTagName(target: AudioTarget, tagName: string) {
    return target.tagName?.toUpperCase() === tagName;
  }

  function isInputWithType(target: AudioTarget, type: string) {
    return hasTagName(target, "INPUT") && (target as HTMLInputElement).type === type;
  }

  function classifyInteractiveTarget(
    target: AudioTarget,
  ): ExplorerAudioElementType {
    if (hasTagName(target, "SELECT") || target.getAttribute("aria-haspopup") === "listbox") {
      return "dropdown";
    }
    if (
      isInputWithType(target, "checkbox") ||
      target.getAttribute("role") === "checkbox" ||
      target.getAttribute("role") === "switch"
    ) {
      return "checkbox";
    }
    if (
      isInputWithType(target, "radio") ||
      target.getAttribute("role") === "radio"
    ) {
      return "radio";
    }
    if (hasTagName(target, "A") || target.getAttribute("role") === "link") {
      return "link";
    }
    if (hasTagName(target, "BUTTON") || target.getAttribute("role") === "button") {
      return "button";
    }
    return "generic";
  }

  function playTargetAction(target: AudioTarget, action: ExplorerAudioAction) {
    audio.playInteraction(classifyInteractiveTarget(target), action);
  }

  function renderSoundEffectsToggle() {
    const toggle = soundEffectsToggle();
    if (!toggle) return;
    const enabled = soundEffectsEnabled();
    toggle.checked = enabled;
    toggle.setAttribute("aria-checked", String(enabled));
  }

  function renderMusicToggle() {
    const toggle = musicToggle();
    if (!toggle) return;
    const enabled = musicEnabled();
    toggle.checked = enabled;
    toggle.setAttribute("aria-checked", String(enabled));
  }

  function setSoundEffects(enabled: boolean) {
    options.savePreference("soundEffects", enabled);
    renderSoundEffectsToggle();
    if (enabled) void audio.resumeAudioContext();
  }

  function setMusic(enabled: boolean) {
    options.savePreference("music", enabled);
    renderMusicToggle();
    audio.syncHelpMusic();
  }

  function getInteractiveTarget(
    target: EventTarget | null,
  ): AudioTarget | null {
    if (!(target instanceof Element)) return null;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!(interactive instanceof HTMLElement)) return null;
    if ("disabled" in interactive && interactive.disabled) return null;
    if (interactive.getAttribute("aria-disabled") === "true") return null;
    return interactive;
  }

  function bindAudioInteractions() {
    if (initialized) return;
    initialized = true;

    const prepareAudio = () => {
      if (audio.soundEffectsEnabled() || audio.musicEnabled()) {
        audio.resumeAudioContext();
      }
    };

    document.addEventListener("pointerdown", prepareAudio, {
      capture: true,
      passive: true,
    });
    document.addEventListener("keydown", prepareAudio, { capture: true });

    document.addEventListener(
      "change",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.matches(".sound-effects-toggle")) {
          const input = target as HTMLInputElement;
          setSoundEffects(input.checked);
          playTargetAction(target as AudioTarget, input.checked ? "check" : "uncheck");
        } else if (target.matches(".music-toggle")) {
          const input = target as HTMLInputElement;
          setMusic(input.checked);
          playTargetAction(target as AudioTarget, input.checked ? "check" : "uncheck");
        } else if (target instanceof HTMLElement) {
          const interactive = getInteractiveTarget(target);
          if (!interactive) return;
          const type = classifyInteractiveTarget(interactive);
          if (type === "checkbox" || type === "radio") {
            const checked =
              hasTagName(interactive, "INPUT")
                ? (interactive as HTMLInputElement).checked
                : interactive.getAttribute("aria-checked") === "true";
            audio.playInteraction(type, checked ? "check" : "uncheck");
          }
        }
      },
      true,
    );

    document.addEventListener(
      "click",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "click");
      },
      true,
    );

    document.addEventListener(
      "pointerover",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target === hoverTarget) return;
        hoverTarget = target;
        playTargetAction(target, "hover");
      },
      true,
    );

    document.addEventListener(
      "pointerout",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target !== hoverTarget) return;
        const relatedTarget = event.relatedTarget;
        if (
          relatedTarget instanceof Element &&
          target.contains(relatedTarget)
        ) {
          return;
        }
        hoverTarget = null;
      },
      true,
    );

    document.addEventListener(
      "focusin",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "focus");
      },
      true,
    );

    document.addEventListener(
      "focusout",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "blur");
      },
      true,
    );

    document.addEventListener(
      "keydown",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "keydown");
      },
      true,
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) audio.stopMusic();
      else audio.syncHelpMusic();
    });

    dialogObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        if (!(record.target instanceof HTMLDialogElement)) return;
        const dialog = record.target;
        if (!dialog.matches(DIALOG_SELECTOR)) return;
        if (dialog.open) {
          audio.playInteraction("dialog", "open");
        } else {
          audio.playInteraction("dialog", "close");
        }
        if (
          dialog.classList.contains("help-dialog") ||
          dialog.classList.contains("saved-dialog")
        ) {
          audio.syncHelpMusic();
        }
      });
    });

    if (document.body) {
      dialogObserver.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["open"],
      });
    }

    themeObserver = new MutationObserver((records) => {
      const changed = records.some(
        (record) =>
          record.type === "attributes" && record.attributeName === "data-theme",
      );
      if (!changed) return;
      audio.restartMusic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

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
