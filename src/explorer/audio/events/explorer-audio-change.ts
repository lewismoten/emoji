import type { ExplorerAudioAction } from "../explorer-audio-types.js";
import * as audioToggle from "../../../controls/audio/audio-toggle.js";
import * as aria from "../../../utils/aria.js";
import { classifyElement, isInput } from "../../../utils/element.js";
import { AudioEventDependencies } from "./audio-event-dependencies.js";

 const buildHandler = (
    dependencies:AudioEventDependencies
) => {

  const playTargetAction = (target: HTMLElement, action: ExplorerAudioAction) =>
    dependencies.audio.playInteraction(classifyElement(target), action);


  const setSoundEffects = async (enabled: boolean) => {
    if (await audioToggle.enableSoundEffects(enabled)) {
      await dependencies.audio.resumeAudioContext();
    }
  };
  const setMusic = async (enabled: boolean) => {
    if (await audioToggle.enableMusic(enabled)) {
      await dependencies.audio.resumeAudioContext();
      await dependencies.audio.restartMusic();
      return;
    }
    await dependencies.audio.syncHelpMusic();
  };

  const handler = async (event: Event) => {
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
        const interactive = dependencies.getInteractiveTarget(target);
        if (!interactive) return;
        const type = classifyElement(interactive);
        if (type !== "checkbox" && type !== "radio") return;
        const checked = isInput(interactive)
          ? interactive.checked
          : aria.isChecked(interactive);
        dependencies.audio.playInteraction(type, checked ? "check" : "uncheck");
      };
      return handler;
    }

    export default buildHandler;