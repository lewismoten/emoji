export default function resolveChoiceElements(
  resolver: (() => ArrayLike<any> | undefined) | undefined,
  selector: string,
) {
  const resolved = Array.from(resolver?.() ?? []).filter(
    (item) => item?.isConnected,
  );
  if (resolved.length > 0) return resolved;
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll(selector));
}
