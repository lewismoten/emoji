import { AudioEventDependencies } from "../audio-event-dependencies.js";
type GetInteractiveTarget = (target: EventTarget|null) => HTMLElement|null;

 const buildHandler = (dependencies: AudioEventDependencies) => {
          
const handler = (event: PointerEvent) => {
        const target = dependencies.getInteractiveTarget(event.target);
        if (!target || target !== dependencies.getHoverTarget()) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Element && target.contains(relatedTarget))
          return;
        dependencies.setHoverTarget(null);
      }
      return handler;
    }
export default buildHandler;