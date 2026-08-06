import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import {
  animateCopyConfirmation,
  announceStatus,
  copyToClipboard,
} from "../../../src/explorer/utility/copy-feedback.js";

const globals = globalThis as typeof globalThis & {
  document?: any;
  navigator?: any;
  window?: any;
};

const originalDocument = globals.document;
const originalNavigator = globals.navigator;
const originalWindow = globals.window;

function restoreGlobals() {
  if (originalDocument === undefined) {
    delete globals.document;
  } else {
    Object.defineProperty(globals, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
  if (originalNavigator === undefined) {
    delete globals.navigator;
  } else {
    Object.defineProperty(globals, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
  if (originalWindow === undefined) {
    delete globals.window;
  } else {
    Object.defineProperty(globals, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
}

afterEach(() => {
  restoreGlobals();
});

describe("copy-feedback", () => {
  it("covers clipboard success, failure, and both animation modes", async () => {
    const status = { textContent: "stale" };
    let timeoutCalls = 0;
    let clipboardWrites: string[] = [];

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { theme: "dark" } },
      },
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: false }),
        setTimeout(callback: () => void) {
          timeoutCalls += 1;
          callback();
          return timeoutCalls;
        },
      },
    });

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          async writeText(value: string) {
            clipboardWrites.push(value);
          },
        },
      },
    });

    announceStatus(status, "Copied");
    assert.equal(timeoutCalls, 1);
    assert.equal(status.textContent, "Copied");
    announceStatus(undefined, "Ignored");
    assert.equal(timeoutCalls, 1);

    assert.equal(
      await copyToClipboard({
        value: "😀",
        successMessage: "Done",
        copyStatus: status,
        translate: (_key, fallback) => fallback,
      }),
      true,
    );
    assert.deepEqual(clipboardWrites, ["😀"]);
    assert.equal(status.textContent, "Done");

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });

    assert.equal(
      await copyToClipboard({
        value: "❌",
        successMessage: "Unused",
        copyStatus: status,
        translate: (key, fallback) =>
          key === "copyFailed" ? "Copy failed" : fallback,
      }),
      false,
    );
    assert.equal(status.textContent, "Copy failed");

    let canceled = false;
    const retroAnimation = { id: "", cancel: () => (canceled = true) };
    const retroButton = {
      animate(frames: unknown, options: unknown) {
        assert.deepEqual(options, { duration: 160, easing: "steps(2, end)" });
        assert.ok(Array.isArray(frames));
        return retroAnimation;
      },
      getAnimations() {
        return [{ id: "emoji-copy-confirmation", cancel: retroAnimation.cancel }];
      },
    };

    globals.document.documentElement.dataset.theme = "retro";
    animateCopyConfirmation(retroButton);
    assert.equal(canceled, true);
    assert.equal(retroAnimation.id, "emoji-copy-confirmation");
    animateCopyConfirmation({});

    let animated = false;
    const normalAnimation = { id: "" };
    let normalCanceled = false;
    const normalButton = {
      animate(frames: unknown, options: unknown) {
        animated = true;
        assert.deepEqual(options, {
          duration: 240,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        });
        assert.ok(Array.isArray(frames));
        return normalAnimation;
      },
      getAnimations() {
        return [{ id: "other-animation", cancel() {} }];
      },
    };

    globals.document.documentElement.dataset.theme = "light";
    animateCopyConfirmation(normalButton);
    assert.equal(animated, true);
    assert.equal(normalAnimation.id, "emoji-copy-confirmation");

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: true }),
        setTimeout(callback: () => void) {
          callback();
          return 1;
        },
      },
    });

    animated = false;
    animateCopyConfirmation(normalButton);
    assert.equal(animated, false);
    animateCopyConfirmation(undefined);

    const cancelingNormalButton = {
      animate(frames: unknown, options: unknown) {
        assert.ok(Array.isArray(frames));
        assert.deepEqual(options, {
          duration: 240,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        });
        return { id: "" };
      },
      getAnimations() {
        return [
          {
            id: "emoji-copy-confirmation",
            cancel() {
              normalCanceled = true;
            },
          },
        ];
      },
    };
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: false }),
        setTimeout(callback: () => void) {
          callback();
          return 1;
        },
      },
    });
    animateCopyConfirmation(cancelingNormalButton);
    assert.equal(normalCanceled, true);

    let fallbackFailure = "";
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        clipboard: {
          async writeText() {
            throw new Error("boom");
          },
        },
      },
    });
    await copyToClipboard({
      value: "💥",
      successMessage: "Unused",
      copyStatus: undefined,
      translate: (key, fallback) => {
        fallbackFailure = `${key}:${fallback}`;
        return fallbackFailure;
      },
    });
    assert.equal(
      fallbackFailure,
      "copyFailed:Could not copy to the clipboard.",
    );
  });
});
