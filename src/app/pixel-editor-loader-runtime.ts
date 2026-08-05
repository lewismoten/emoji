import { createPixelEditorLoader } from "../explorer/pixel-editor-loader.js";
import { loadStylesheet } from "../explorer/dialog/dialog-view.js";
import * as state from "../state.js";

export function createPixelEditorRuntime(options: any) {
  const loadPixelEditor = createPixelEditorLoader({
    currentEmojiKey: state.currentEmojiKey.get,
    dialog: () => options.dialog(),
    formatNumber: options.formatNumber,
    formatPercent: options.formatPercent,
    getEditor: () => options.getEditor(),
    getPromise: () => options.getPromise(),
    loadEditor: () => import("../pixel-editor-entry.js"),
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
