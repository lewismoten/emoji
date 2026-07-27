export function createPixelEditorLoader(options: {
  currentEmojiKey: () => string;
  dialog: () => HTMLElement;
  emojiByKey: () => Record<string, string>;
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  getEditor: () => any;
  getPromise: () => Promise<any> | undefined;
  loadStylesheet: () => Promise<unknown>;
  loadEditor: () => Promise<{ createPixelEditor: (options: any) => any }>;
  setEditor: (editor: any) => void;
  setPromise: (promise: Promise<any> | undefined) => void;
  translate: (key: string, fallback: string) => string;
}) {
  return async () => {
    const existing = options.getEditor();
    if (existing) return existing;
    let promise = options.getPromise();
    if (!promise) {
      promise = Promise.all([options.loadStylesheet(), options.loadEditor()])
        .then(([, { createPixelEditor }]) => {
          const editor = createPixelEditor({
            dialog: options.dialog(),
            translate: options.translate,
            formatNumber: options.formatNumber,
            formatPercent: options.formatPercent,
          });
          editor.refreshTranslations();
          options.setEditor(editor);
          return editor;
        })
        .catch((error) => {
          options.setPromise(undefined);
          console.warn("Pixel editor unavailable", error);
          return undefined;
        });
      options.setPromise(promise);
    }
    const editor = await promise;
    const dialog = options.dialog();
    const key = options.currentEmojiKey();
    if (!editor || !dialog.classList.contains("is-editor-view")) return editor;
    editor.element.hidden = false;
    if (key) await editor.open(key, options.emojiByKey()[key]);
    editor.element
      .querySelector(".pixel-editor-canvas")
      ?.focus({ preventScroll: true });
    return editor;
  };
}
