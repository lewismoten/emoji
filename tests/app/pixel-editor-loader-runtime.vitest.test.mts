import { describe, expect, it, vi } from "vitest";

describe("createPixelEditorRuntime", () => {
  it("stubs module collaborators through Vitest spies", async () => {
    const state = await import("../../src/state.js");
    const loaderModule =
      await import("../../src/explorer/pixel-editor-loader.js");
    const dialogViewModule =
      await import("../../src/explorer/dialog/dialog-view.js");

    vi.spyOn(state.currentEmojiKey, "get").mockReturnValue("wave");
    const loadStylesheet = vi
      .spyOn(dialogViewModule, "loadStylesheet")
      .mockReturnValue(["load-stylesheet"] as any);
    const createPixelEditorLoader = vi
      .spyOn(loaderModule, "createPixelEditorLoader")
      .mockImplementation((options: any) => {
        return () => Promise.resolve(["pixel-editor-loader", options]);
      });

    const { createPixelEditorRuntime } =
      await import("../../src/app/pixel-editor-loader-runtime.js");

    let editor: unknown = "editor";
    let promise: unknown = "promise";
    const runtime = createPixelEditorRuntime({
      dialog: vi.fn(() => "dialog"),
      formatNumber: "format-number",
      formatPercent: "format-percent",
      getEditor: vi.fn(() => editor),
      getPromise: vi.fn(() => promise),
      setEditor: vi.fn((value: unknown) => {
        editor = value;
      }),
      setPromise: vi.fn((value: unknown) => {
        promise = value;
      }),
      translate: vi.fn(),
    });

    expect(createPixelEditorLoader).toHaveBeenCalledTimes(1);
    const [options] = createPixelEditorLoader.mock.calls[0]!;
    expect(options.currentEmojiKey()).toBe("wave");
    expect(options.dialog()).toBe("dialog");
    expect(options.formatNumber).toBe("format-number");
    expect(options.formatPercent).toBe("format-percent");
    expect(options.getEditor()).toBe("editor");
    expect(options.getPromise()).toBe("promise");

    options.setEditor("next-editor");
    options.setPromise(Promise.resolve("next-promise"));
    expect(editor).toBe("next-editor");
    await expect(promise).resolves.toBe("next-promise");

    expect(options.loadStylesheet()).toEqual(["load-stylesheet"]);
    expect(loadStylesheet).toHaveBeenCalledWith(
      "./explorer/pixel-editor.css",
      "pixel-editor-stylesheet",
    );

    const result = await runtime.ensurePixelEditor();
    expect(result).toEqual(["pixel-editor-loader", options]);
  });
});
