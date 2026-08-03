import { classifyElement } from "../../../../utils/element.js";
import { AudioEventDependencies } from "../audio-event-dependencies.js";

 const buildHandler = (dependencies: AudioEventDependencies) => {

const handler = (event: PointerEvent) => {
        const target = dependencies.getInteractiveTarget(event.target);
        if (!target || target === dependencies.getHoverTarget()) return;
        dependencies.setHoverTarget(target);
        dependencies.audio.playInteraction(classifyElement(target), "hover");
      }
      return handler;
    }
export default buildHandler;