import { classifyElement } from "../../../../utils/element.js";
import { AudioEventDependencies } from "../audio-event-dependencies.js";

 const buildHandler = (dependencies:AudioEventDependencies) => {

  const handler = (event: FocusEvent) => {
        const target = dependencies.getInteractiveTarget(event.target);
          if (target) dependencies.audio.playInteraction(classifyElement(target), "blur");
      }
      return handler;
    }

    export default buildHandler;