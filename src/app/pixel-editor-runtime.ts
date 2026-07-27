import { createPixelEditorLoader } from "../explorer/pixel-editor-loader.js";
import { loadStylesheet } from "../explorer/dialog-view.js";

export function createPixelEditorRuntime(options: any) {
  const loadPixelEditor = createPixelEditorLoader({
    currentEmojiKey: () => options.currentEmojiKey(),
    dialog: () => options.dialog(),
    emojiByKey: () => options.emojiByKey(),
    formatNumber: options.formatNumber,
    formatPercent: options.formatPercent,
    getEditor: () => options.getEditor(),
    getPromise: () => options.getPromise(),
    loadEditor: () =>
      // @ts-expect-error -- Generated/browser entry lives outside the TS program for now.
      import("../../pixel-editor.js"),
    loadStylesheet: () =>
      loadStylesheet("./explorer/pixel-editor.css", "pixel-editor-stylesheet"),
    setEditor: (editor: any) => options.setEditor(editor),
    setPromise: (promise: Promise<any> | undefined) =>
      options.setPromise(promise),
    translate: options.translate,
  });

  return {
    ensurePixelEditor() {
      return loadPixelEditor();
    },
  };
}
