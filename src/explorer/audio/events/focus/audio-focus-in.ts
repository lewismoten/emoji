import { classifyElement } from "../../../../utils/element.js";
import type { ExplorerAudioAction } from "../../explorer-audio-types.js";
import { AudioEventDependencies } from "../audio-event-dependencies.js";

 const buildHandler = (dependencies:AudioEventDependencies) => {
            const playTargetAction = (target: HTMLElement, action: ExplorerAudioAction) =>
              dependencies.audio.playInteraction(classifyElement(target), action);
          

const handler = (event: FocusEvent) => {
        const target = dependencies.getInteractiveTarget(event.target);
          if (target) playTargetAction(target, "focus");
      }
      return handler;
    }

export default buildHandler;