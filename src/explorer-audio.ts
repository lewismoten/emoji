import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";
import * as dialogListeners from "./controls/dialog/dialog-listeners.js";
import documentRef, { addEventListener } from "./utils/document.js";
import * as audioToggle from "./controls/audio/audio-toggle.js";
import buildAudioHandlers from "./explorer/audio/events/audio-handlers.js";

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
  const getHoverTarget = () => hoverTarget;
  const setHoverTarget = (target: HTMLElement | null) => (hoverTarget = target);

  const audio = helpers.createExplorerAudioEngine();

  function bindAudioInteractions() {
    if (initialized) return;
    const activeDocument = documentRef();
    if (!activeDocument) return;
    initialized = true;

    const handlers = buildAudioHandlers({
      audio,
      getHoverTarget,
      setHoverTarget,
      document: activeDocument,
    });

    addEventListener("pointerdown", handlers.pointer.down, {
      capture: true,
      passive: true,
    });
    addEventListener("keydown", handlers.pointer.down, { capture: true });
    addEventListener("change", handlers.change, true);
    addEventListener("click", handlers.pointer.click, true);
    addEventListener("pointerover", handlers.pointer.over, true);
    addEventListener("pointerout", handlers.pointer.out, true);
    addEventListener("focusin", handlers.focus.in, true);
    addEventListener("focusout", handlers.focus.out, true);
    addEventListener("keydown", handlers.keyboard.down, true);
    addEventListener("visibilitychange", handlers.visibility.change);

    dialogListeners.add(handlers.dialog);

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
