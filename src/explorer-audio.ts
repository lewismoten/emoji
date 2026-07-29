type ExplorerAudioOptions = {
  savePreference: (key: string, value: unknown) => void;
  state: () => { explorerPreferences: Record<string, any> };
};

import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";

type AudioTarget = HTMLElement;

const INTERACTIVE_SELECTOR =
  'button, [role="button"], .modifier-filter-option, input[type="checkbox"][role="switch"], input[type="checkbox"].sound-effects-toggle, input[type="checkbox"].music-toggle';

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
          setSoundEffects((target as HTMLInputElement).checked);
        } else if (target.matches(".music-toggle")) {
          setMusic((target as HTMLInputElement).checked);
        }
      },
      true,
    );

    document.addEventListener(
      "click",
      (event) => {
        if (getInteractiveTarget(event.target)) audio.playClick();
      },
      true,
    );

    document.addEventListener(
      "pointerover",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target === hoverTarget) return;
        hoverTarget = target;
        audio.playHover();
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
          audio.playDialogOpen();
        } else {
          audio.playDialogClose();
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
