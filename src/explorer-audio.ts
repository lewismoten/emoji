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
  'a[href], button, select, input, label, [tabindex], [role="button"], [role="checkbox"], [role="link"], [role="radio"], [role="switch"], [aria-haspopup="listbox"], .modifier-filter-option, .setting-choice, .theme-choice, .mode-choice, .audio-choice, .emoji-font-choice, .language-option, .saved-picker, .help-picker, .order-mode, .compact-choice, .version-mode-toggle, .version-step, .filter-picker-trigger, [data-emoji-key]';
const DIALOG_SELECTOR =
  ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";

export const createExplorerAudioDependencies = () => ({
  createExplorerAudioEngine,
});

export function createExplorerAudioController(
  options: ExplorerAudioOptions,
  dependencies?: ReturnType<typeof createExplorerAudioDependencies>,
) {
  const helpers = dependencies ?? createExplorerAudioDependencies();
  let initialized = false;
  let dialogObserver: MutationObserver | undefined;
  let themeObserver: MutationObserver | undefined;
  let hoverTarget: AudioTarget | null = null;

  const documentRef = () =>
    typeof globalThis.document === "undefined"
      ? undefined
      : globalThis.document;
  const preferences = () => options.state().explorerPreferences;
  const baseMode = () =>
    documentRef()?.documentElement?.dataset?.theme === "base";
  const retroMode = () =>
    documentRef()?.documentElement?.dataset?.theme === "retro";
  const soundEffectsEnabled = () =>
    !baseMode() && preferences().soundEffects === true;
  const musicEnabled = () => !baseMode() && preferences().music === true;
  const soundEffectsToggle = () =>
    documentRef()?.querySelector<HTMLInputElement>(
      '.audio-choice-input[value="soundEffects"]',
    ) ?? null;
  const musicToggle = () =>
    documentRef()?.querySelector<HTMLInputElement>(
      '.audio-choice-input[value="music"]',
    ) ?? null;
  const helpDialog = () =>
    documentRef()?.querySelector<HTMLDialogElement>(".help-dialog") ?? null;
  const savedDialog = () =>
    documentRef()?.querySelector<HTMLDialogElement>(".saved-dialog") ?? null;
  const audio = helpers.createExplorerAudioEngine({
    helpDialogOpen: () => helpDialog()?.open === true,
    musicEnabled,
    retroMode,
    theme: () =>
      (documentRef()?.documentElement?.dataset?.theme as
        "base" | "dark" | "light" | "retro") ?? "dark",
    savedDialogOpen: () => savedDialog()?.open === true,
    soundEffectsEnabled,
  });

  const hasTagName = (target: AudioTarget, tagName: string) =>
    target.tagName?.toUpperCase() === tagName;
  const isInputWithType = (target: AudioTarget, type: string) =>
    hasTagName(target, "INPUT") && (target as HTMLInputElement).type === type;
  const classifyInteractiveTarget = (
    target: AudioTarget,
  ): ExplorerAudioElementType => {
    if (
      hasTagName(target, "SELECT") ||
      target.getAttribute("aria-haspopup") === "listbox"
    )
      return "dropdown";
    if (
      isInputWithType(target, "checkbox") ||
      target.getAttribute("role") === "checkbox" ||
      target.getAttribute("role") === "switch"
    )
      return "checkbox";
    if (
      isInputWithType(target, "radio") ||
      target.getAttribute("role") === "radio"
    )
      return "radio";
    if (hasTagName(target, "A") || target.getAttribute("role") === "link")
      return "link";
    if (
      hasTagName(target, "BUTTON") ||
      target.getAttribute("role") === "button"
    )
      return "button";
    return "generic";
  };
  const playTargetAction = (target: AudioTarget, action: ExplorerAudioAction) =>
    audio.playInteraction(classifyInteractiveTarget(target), action);
  const renderAudioToggle = (
    toggle: HTMLInputElement | null,
    enabled: boolean,
  ) => {
    if (!toggle) return;
    toggle.checked = enabled;
    toggle.disabled = baseMode();
    toggle.setAttribute("aria-checked", String(enabled));
    toggle.setAttribute("aria-disabled", String(baseMode()));
    toggle.parentElement?.setAttribute("aria-pressed", String(enabled));
    toggle.parentElement?.setAttribute("aria-disabled", String(baseMode()));
  };
  const renderSoundEffectsToggle = () =>
    renderAudioToggle(soundEffectsToggle(), soundEffectsEnabled());
  const renderMusicToggle = () =>
    renderAudioToggle(musicToggle(), musicEnabled());

  function setSoundEffects(enabled: boolean) {
    if (baseMode()) return void renderSoundEffectsToggle();
    options.savePreference("soundEffects", enabled);
    renderSoundEffectsToggle();
    if (enabled) void audio.resumeAudioContext();
  }

  function setMusic(enabled: boolean) {
    if (baseMode()) {
      renderMusicToggle();
      return void audio.syncHelpMusic();
    }
    options.savePreference("music", enabled);
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
  ): AudioTarget | null => {
    if (!(target instanceof Element)) return null;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!(interactive instanceof HTMLElement)) return null;
    if ("disabled" in interactive && interactive.disabled) return null;
    if (interactive.getAttribute("aria-disabled") === "true") return null;
    return interactive;
  };

  function bindAudioInteractions() {
    if (initialized) return;
    const activeDocument = documentRef();
    if (!activeDocument) return;
    initialized = true;

    const prepareAudio = () =>
      (audio.soundEffectsEnabled() || audio.musicEnabled()) &&
      audio.resumeAudioContext();
    activeDocument.addEventListener("pointerdown", prepareAudio, {
      capture: true,
      passive: true,
    });
    activeDocument.addEventListener("keydown", prepareAudio, { capture: true });

    activeDocument.addEventListener(
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
            target as AudioTarget,
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
            target as AudioTarget,
            input.checked ? "check" : "uncheck",
          );
        }
        if (!(target instanceof HTMLElement)) return;
        const interactive = getInteractiveTarget(target);
        if (!interactive) return;
        const type = classifyInteractiveTarget(interactive);
        if (type !== "checkbox" && type !== "radio") return;
        const checked = hasTagName(interactive, "INPUT")
          ? (interactive as HTMLInputElement).checked
          : interactive.getAttribute("aria-checked") === "true";
        audio.playInteraction(type, checked ? "check" : "uncheck");
      },
      true,
    );

    activeDocument.addEventListener(
      "click",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "click");
      },
      true,
    );
    activeDocument.addEventListener(
      "pointerover",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target === hoverTarget) return;
        hoverTarget = target;
        playTargetAction(target, "hover");
      },
      true,
    );
    activeDocument.addEventListener(
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
    [
      ["focusin", "focus"],
      ["focusout", "blur"],
      ["keydown", "keydown"],
    ].forEach(([eventName, action]) =>
      activeDocument.addEventListener(
        eventName,
        (event) => {
          const target = getInteractiveTarget(event.target);
          if (target) playTargetAction(target, action as ExplorerAudioAction);
        },
        true,
      ),
    );

    activeDocument.addEventListener("visibilitychange", () => {
      if (activeDocument.hidden) audio.stopMusic();
      else audio.syncHelpMusic();
    });

    dialogObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        if (!(record.target instanceof HTMLDialogElement)) return;
        const dialog = record.target;
        if (!dialog.matches(DIALOG_SELECTOR)) return;
        audio.playInteraction("dialog", dialog.open ? "open" : "close");
        if (
          dialog.classList.contains("help-dialog") ||
          dialog.classList.contains("saved-dialog")
        ) {
          audio.syncHelpMusic();
        }
      });
    });
    if (activeDocument.body) {
      dialogObserver.observe(activeDocument.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["open"],
      });
    }

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
