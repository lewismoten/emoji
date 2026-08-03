export const documentRef = () =>
  typeof globalThis.document === "undefined" ? undefined : globalThis.document;
export const querySelector = <T extends Element = Element>(
  selector: string,
): T | null => documentRef()?.querySelector<T>(selector) ?? null;
export const selectAll = <T extends Element = Element>(
  selector: string,
): NodeListOf<T> =>
  documentRef()?.querySelectorAll<T>(selector) ??
  (new NodeList() as NodeListOf<T>);

export const addEventListener = <K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): void => documentRef()?.addEventListener(type, listener, options);
export const setDocAttribute = (name: string, value: string) => {
  documentRef()?.documentElement.setAttribute(name, value);
};
export const setLocale = (lang: string, dir: "rtl" | "ltr") => {
  const doc = documentRef()?.documentElement;
  if (!doc) return;
  doc.setAttribute("lang", lang);
  doc.setAttribute("dir", dir);
};
export const setTitle = (title: string) => {
  const doc = documentRef();
  if (!doc) return;
  document.title = title;
  for (const name of ["application-name", "apple-mobile-web-app-title"]) {
    const meta = querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (meta) meta.content = title;
  }
};
export default documentRef;
