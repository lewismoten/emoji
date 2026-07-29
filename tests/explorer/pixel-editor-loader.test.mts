import assert from "node:assert/strict";
import { createPixelEditorLoader } from "../../src/explorer/pixel-editor-loader.js";

const warnings: any[][] = [];
const originalWarn = console.warn;
console.warn = (...args: any[]) => warnings.push(args);

try {
  let editorRef: any;
  let promiseRef: Promise<any> | undefined;
  const dialog = {
    classList: {
      contains(name: string) {
        return name === "is-editor-view";
      },
    },
  };
  const canvas = {
    focused: false,
    focus() {
      this.focused = true;
    },
  };
  const createdEditors: any[] = [];
  const ensureEditor = createPixelEditorLoader({
    currentEmojiKey: () => "sparkles",
    dialog: () =>
      ({
        ...dialog,
        querySelector(selector: string) {
          return selector === ".pixel-editor-canvas" ? canvas : null;
        },
      }) as any,
    emojiByKey: () => ({ sparkles: "✨" }),
    formatNumber: (value: number) => `#${value}`,
    formatPercent: (value: number) => `${value}%`,
    getEditor: () => editorRef,
    getPromise: () => promiseRef,
    loadEditor: async () => ({
      createPixelEditor(options: any) {
        const editor = {
          element: { hidden: true, querySelector: () => canvas },
          opened: [] as Array<[string, string]>,
          open: async (key: string, value: string) => {
            editor.opened.push([key, value]);
          },
          refreshTranslations() {
            createdEditors.push(options);
          },
        };
        return editor;
      },
    }),
    loadStylesheet: async () => undefined,
    setEditor: (editor: any) => {
      editorRef = editor;
    },
    setPromise: (promise: Promise<any> | undefined) => {
      promiseRef = promise;
    },
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
  });

  const editor = await ensureEditor();
  assert.equal(createdEditors.length, 1);
  assert.equal(editorRef, editor);
  assert.equal(editor.element.hidden, false);
  assert.deepEqual(editor.opened, [["sparkles", "✨"]]);
  assert.equal(canvas.focused, true);
  assert.equal(await promiseRef, editor);

  const sameEditor = await ensureEditor();
  assert.equal(sameEditor, editor);

  editorRef = undefined;
  promiseRef = undefined;
  canvas.focused = false;
  const nonEditorView = createPixelEditorLoader({
    currentEmojiKey: () => "sparkles",
    dialog: () =>
      ({
        classList: {
          contains() {
            return false;
          },
        },
      }) as any,
    emojiByKey: () => ({ sparkles: "✨" }),
    formatNumber: (value: number) => `#${value}`,
    formatPercent: (value: number) => `${value}%`,
    getEditor: () => editorRef,
    getPromise: () => promiseRef,
    loadEditor: async () => ({
      createPixelEditor() {
        return {
          element: { hidden: true, querySelector: () => canvas },
          open: async () => {},
          refreshTranslations() {},
        };
      },
    }),
    loadStylesheet: async () => undefined,
    setEditor: (editor: any) => {
      editorRef = editor;
    },
    setPromise: (promise: Promise<any> | undefined) => {
      promiseRef = promise;
    },
    translate: (_key: string, fallback: string) => fallback,
  });
  await nonEditorView();
  assert.equal(canvas.focused, false);

  editorRef = undefined;
  promiseRef = undefined;
  const failureLoader = createPixelEditorLoader({
    currentEmojiKey: () => "sparkles",
    dialog: () => dialog as any,
    emojiByKey: () => ({ sparkles: "✨" }),
    formatNumber: (value: number) => String(value),
    formatPercent: (value: number) => String(value),
    getEditor: () => editorRef,
    getPromise: () => promiseRef,
    loadEditor: async () => {
      throw new Error("boom");
    },
    loadStylesheet: async () => undefined,
    setEditor: (editor: any) => {
      editorRef = editor;
    },
    setPromise: (promise: Promise<any> | undefined) => {
      promiseRef = promise;
    },
    translate: (_key: string, fallback: string) => fallback,
  });
  const failed = await failureLoader();
  assert.equal(failed, undefined);
  assert.equal(promiseRef, undefined);
  assert.equal(warnings.at(-1)?.[0], "Pixel editor unavailable");
} finally {
  console.warn = originalWarn;
}
