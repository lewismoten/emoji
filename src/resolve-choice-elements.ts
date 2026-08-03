import { selectAll } from "./utils/document";

function resolveChoiceElements(
  choices: (() => any[] | undefined) | undefined,
  selector: string,
) {
  const supplied = (choices?.() ?? []).filter(
    (choice) => choice && typeof choice === "object" && choice.isConnected,
  );
  if (Array.isArray(supplied) && supplied.length > 0) return supplied;
  if (typeof document === "undefined") return [];
  return Array.from(selectAll(selector));
}

export default resolveChoiceElements;
