type ExplorerAudioOptions = {
  savePreference: (key: string, value: unknown) => void;
  state: () => { explorerPreferences: Record<string, any> };
};

type AudioTarget = HTMLElement;

const INTERACTIVE_SELECTOR =
  'button, [role="button"], input[type="checkbox"][role="switch"], input[type="checkbox"].sound-effects-toggle, input[type="checkbox"].music-toggle';

const DIALOG_SELECTOR =
  ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";

export function createExplorerAudioController(options: ExplorerAudioOptions) {
  let audioContext: AudioContext | undefined;
  let masterGain: GainNode | undefined;
  let initialized = false;
  let dialogObserver: MutationObserver | undefined;
  let hoverTarget: AudioTarget | null = null;
  let musicTimer: number | undefined;
  let musicBeat = 0;
  let musicGain: GainNode | undefined;

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

  function getAudioContext() {
    if (audioContext) return audioContext;
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) return undefined;
    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(audioContext.destination);
    return audioContext;
  }

  function resumeAudioContext() {
    const context = getAudioContext();
    if (!context) return Promise.resolve(undefined);
    if (context.state === "running") return Promise.resolve(context);
    if (context.state === "suspended") {
      return context
        .resume()
        .then(() => context)
        .catch(() => undefined);
    }
    return Promise.resolve(context);
  }

  function createTone(
    frequency: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = "square",
    endFrequency?: number,
  ) {
    const context = getAudioContext();
    if (!context || !masterGain) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(endFrequency, 1),
        start + duration,
      );
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playEffect(
    runner: (context: AudioContext) => void,
    requiresRetro = true,
  ) {
    if (!soundEffectsEnabled()) return;
    if (requiresRetro && !retroMode()) return;
    const context = getAudioContext();
    if (!context) return;
    if (context.state !== "running") return;
    runner(context);
  }

  function playClick() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(220, start, 0.05, 0.16, "square", 180);
      createTone(110, start + 0.018, 0.06, 0.08, "square", 92);
    });
  }

  function playHover() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(320, start, 0.08, 0.05, "square", 620);
    });
  }

  function playDialogOpen() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(262, start, 0.08, 0.08, "square");
      createTone(330, start + 0.035, 0.08, 0.08, "square");
      createTone(392, start + 0.07, 0.1, 0.09, "square");
    });
  }

  function playDialogClose() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(392, start, 0.08, 0.08, "square");
      createTone(294, start + 0.04, 0.08, 0.07, "square");
      createTone(196, start + 0.08, 0.1, 0.07, "square");
    });
  }

  function shouldPlayMusic() {
    return (
      retroMode() &&
      musicEnabled() &&
      (helpDialog()?.open === true || savedDialog()?.open === true)
    );
  }

  function stopMusic() {
    if (musicTimer) {
      window.clearTimeout(musicTimer);
      musicTimer = undefined;
    }
    if (musicGain && audioContext) {
      musicGain.gain.cancelScheduledValues(audioContext.currentTime);
      musicGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.04);
      window.setTimeout(() => {
        musicGain?.disconnect();
        musicGain = undefined;
      }, 120);
    }
    musicBeat = 0;
  }

  function scheduleMusic() {
    if (!shouldPlayMusic()) {
      stopMusic();
      return;
    }
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    if (!musicGain) {
      musicGain = context.createGain();
      musicGain.gain.value = 0.09;
      musicGain.connect(masterGain);
    }

    const beatLength = 0.18;
    const pattern = [262, 330, 392, 330, 262, 392, 330, 294];
    const bass = [131, 147, 165, 147];
    const start = context.currentTime + 0.02;

    for (let step = 0; step < pattern.length; step += 1) {
      const beat = musicBeat + step;
      const noteStart = start + step * beatLength;
      const lead = context.createOscillator();
      const leadGain = context.createGain();
      lead.type = "square";
      lead.frequency.setValueAtTime(pattern[beat % pattern.length], noteStart);
      leadGain.gain.setValueAtTime(0.0001, noteStart);
      leadGain.gain.exponentialRampToValueAtTime(0.24, noteStart + 0.01);
      leadGain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + beatLength * 0.75,
      );
      lead.connect(leadGain);
      leadGain.connect(musicGain);
      lead.start(noteStart);
      lead.stop(noteStart + beatLength * 0.85);

      if (step % 2 === 0) {
        const bassOscillator = context.createOscillator();
        const bassGain = context.createGain();
        bassOscillator.type = "triangle";
        bassOscillator.frequency.setValueAtTime(
          bass[(beat / 2) % bass.length],
          noteStart,
        );
        bassGain.gain.setValueAtTime(0.0001, noteStart);
        bassGain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.01);
        bassGain.gain.exponentialRampToValueAtTime(
          0.0001,
          noteStart + beatLength * 1.6,
        );
        bassOscillator.connect(bassGain);
        bassGain.connect(musicGain);
        bassOscillator.start(noteStart);
        bassOscillator.stop(noteStart + beatLength * 1.7);
      }
    }

    musicBeat += pattern.length;
    musicTimer = window.setTimeout(
      scheduleMusic,
      beatLength * pattern.length * 1000 - 60,
    );
  }

  function syncHelpMusic() {
    if (shouldPlayMusic()) {
      if (!musicTimer) {
        void resumeAudioContext().then(() => {
          if (shouldPlayMusic() && !musicTimer) scheduleMusic();
        });
      } else {
        void resumeAudioContext();
      }
    } else {
      stopMusic();
    }
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
    if (enabled) void resumeAudioContext();
  }

  function setMusic(enabled: boolean) {
    options.savePreference("music", enabled);
    renderMusicToggle();
    syncHelpMusic();
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
      if (soundEffectsEnabled() || musicEnabled()) resumeAudioContext();
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
        if (getInteractiveTarget(event.target)) playClick();
      },
      true,
    );

    document.addEventListener(
      "pointerover",
      (event) => {
        const target = getInteractiveTarget(event.target);
        if (!target || target === hoverTarget) return;
        hoverTarget = target;
        playHover();
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
      if (document.hidden) stopMusic();
      else syncHelpMusic();
    });

    dialogObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        if (!(record.target instanceof HTMLDialogElement)) return;
        const dialog = record.target;
        if (!dialog.matches(DIALOG_SELECTOR)) return;
        if (dialog.open) {
          playDialogOpen();
        } else {
          playDialogClose();
        }
        if (
          dialog.classList.contains("help-dialog") ||
          dialog.classList.contains("saved-dialog")
        ) {
          syncHelpMusic();
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

    renderSoundEffectsToggle();
    renderMusicToggle();
    syncHelpMusic();
  }

  return {
    bindAudioInteractions,
    renderMusicToggle,
    renderSoundEffectsToggle,
    syncHelpMusic,
  };
}
