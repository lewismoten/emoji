import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import { createEmojiDialogClickHandler } from "../../../src/explorer/dialog/emoji-dialog-events.js";

class FakeTarget {
  constructor(
    private closestMap: Record<string, any>,
    private matchMap: Record<string, boolean> = {},
  ) {}

  closest(selector: string) {
    return this.closestMap[selector] ?? null;
  }

  matches(selector: string) {
    return this.matchMap[selector] ?? false;
  }
}

class FakeDialog {
  dataset: Record<string, string> = { dialogParentPanel: "favorites" };
  editorMode = false;
  focusTargets = new Map<string, { focused: number; focus(): void }>();

  classList = {
    contains: (name: string) => name === "is-editor-view" && this.editorMode,
  };

  querySelector(selector: string) {
    return this.focusTargets.get(selector) ?? null;
  }
}

const originalWindow = globalThis.window;

afterEach(() => {
  (globalThis as any).window = originalWindow;
});

describe("emoji-dialog-events", () => {
  it("routes emoji dialog clicks through the expected handlers", async () => {
    (globalThis as any).window = {
      history: {
        state: { dialogParentPanel: "history-help" },
        backCalled: 0,
        back() {
          this.backCalled += 1;
        },
      },
    };

    const dialog = new FakeDialog();
    const modeBack = { focused: 0, focus() { this.focused += 1; } };
    const codeButton = { focused: 0, focus() { this.focused += 1; } };
    const editorCanvas = { focused: 0, focus() { this.focused += 1; } };
    const editorButton = { focused: 0, focus() { this.focused += 1; } };
    dialog.focusTargets.set(".dialog-mode-back:not([hidden])", modeBack);
    dialog.focusTargets.set(".show-emoji-code", codeButton);
    dialog.focusTargets.set(".pixel-editor-canvas", editorCanvas);
    dialog.focusTargets.set(".show-pixel-editor", editorButton);

    const calls = {
      toggleComposition: 0,
      refreshComposition: 0,
      sync: 0,
      openComposition: [] as string[],
      openParentPanel: [] as string[],
      toggleFavorite: 0,
      setView: [] as string[],
      copy: [] as Array<[string, string]>,
      recordCopied: [] as string[],
      animate: 0,
    };

    const handler = createEmojiDialogClickHandler({
      animateCopy: () => {
        calls.animate += 1;
      },
      copy: async (value: string, message: string) => {
        calls.copy.push([value, message]);
        return true;
      },
      copyValue: (kind: string) => {
        if (kind === "missing") return undefined;
        return `value:${kind}`;
      },
      currentEmojiKey: () => "wrappedGift",
      dialog: () => dialog,
      openComposition: (key: string) => {
        calls.openComposition.push(key);
      },
      openParentPanel: (panel: string) => {
        calls.openParentPanel.push(panel);
      },
      recordCopiedEmoji: (key: string) => {
        calls.recordCopied.push(key);
      },
      refreshComposition: () => {
        calls.refreshComposition += 1;
      },
      setView: (mode: string) => {
        calls.setView.push(mode);
      },
      syncUrlState: () => {
        calls.sync += 1;
      },
      toggleComposition: () => {
        calls.toggleComposition += 1;
      },
      toggleFavorite: () => {
        calls.toggleFavorite += 1;
      },
      translate: (_key: string, fallback: string) => fallback,
    });

    handler({
      target: new FakeTarget({
        ".emoji-composition-mode": { id: "toggle" },
      }),
    } as unknown as MouseEvent);
    assert.equal(calls.toggleComposition, 1);
    assert.equal(calls.refreshComposition, 1);
    assert.equal(calls.sync, 1);

    handler({
      target: new FakeTarget({
        "[data-composition-emoji]": { dataset: { compositionEmoji: "partyPopper" } },
      }),
    } as unknown as MouseEvent);
    assert.deepEqual(calls.openComposition, ["partyPopper"]);

    handler({
      target: new FakeTarget({
        ".emoji-parent": { id: "parent" },
      }),
    } as unknown as MouseEvent);
    assert.deepEqual(calls.openParentPanel, ["favorites"]);

    dialog.dataset.dialogParentPanel = "";
    handler({
      target: new FakeTarget({
        ".emoji-parent": { id: "parent" },
      }),
    } as unknown as MouseEvent);
    assert.equal((globalThis as any).window.history.backCalled, 1);

    handler({
      target: new FakeTarget({
        ".toggle-favorite": { id: "favorite" },
      }),
    } as unknown as MouseEvent);
    assert.equal(calls.toggleFavorite, 1);

    handler({
      target: new FakeTarget({
        ".show-emoji-code": { id: "code" },
      }),
    } as unknown as MouseEvent);
    assert.deepEqual(calls.setView.at(-1), "code");
    assert.equal(modeBack.focused, 1);

    handler({
      target: new FakeTarget({
        ".show-pixel-editor": { id: "editor" },
      }),
    } as unknown as MouseEvent);
    assert.deepEqual(calls.setView.at(-1), "editor");
    assert.equal(editorCanvas.focused, 1);

    dialog.editorMode = false;
    handler({
      target: new FakeTarget({
        ".dialog-mode-back, .back-to-emoji": { id: "back" },
      }),
    } as unknown as MouseEvent);
    assert.deepEqual(calls.setView.at(-1), "details");
    assert.equal(codeButton.focused, 1);

    dialog.editorMode = true;
    handler({
      target: new FakeTarget({
        ".dialog-mode-back, .back-to-emoji": { id: "back" },
      }),
    } as unknown as MouseEvent);
    assert.equal(editorButton.focused, 1);

    handler({
      target: new FakeTarget({
        "[data-copy]": {
          dataset: { copy: "emoji" },
          matches: (selector: string) => selector === ".emoji-preview",
        },
      }),
    } as unknown as MouseEvent);
    await Promise.resolve();
    assert.deepEqual(calls.copy.at(-1), [
      "value:emoji",
      "Emoji copied to the clipboard.",
    ]);
    assert.deepEqual(calls.recordCopied.at(-1), "wrappedGift");
    assert.equal(calls.animate, 1);

    handler({
      target: new FakeTarget({
        "[data-copy]": {
          dataset: { copy: "unknown" },
          matches: () => false,
        },
      }),
    } as unknown as MouseEvent);
    await Promise.resolve();
    assert.deepEqual(calls.copy.at(-1), [
      "value:unknown",
      "Copied to the clipboard.",
    ]);

    handler({
      target: new FakeTarget({
        "[data-copy]": {
          dataset: { copy: "missing" },
          matches: () => false,
        },
      }),
    } as unknown as MouseEvent);
    await Promise.resolve();
    assert.equal(calls.copy.length, 2);
  });
});
