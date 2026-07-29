import assert from "node:assert/strict";
import { observeToolbarHeight } from "../../src/explorer/toolbar/toolbar-layout.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

try {
  const styleCalls: Array<[string, string]> = [];
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: {
        style: {
          setProperty(name: string, value: string) {
            styleCalls.push([name, value]);
          },
        },
      },
    },
  });

  let observedTarget: unknown;
  class FakeResizeObserver {
    callback: (entries: any[]) => void;
    constructor(callback: (entries: any[]) => void) {
      this.callback = callback;
    }
    observe(target: unknown) {
      observedTarget = target;
      this.callback([
        {
          borderBoxSize: [{ blockSize: 72 }],
          contentRect: { height: 10 },
        },
      ]);
    }
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ResizeObserver: FakeResizeObserver,
    },
  });

  const toolbar = { offsetHeight: 48 };
  observeToolbarHeight(toolbar as any);
  assert.equal(observedTarget, toolbar);
  assert.deepEqual(styleCalls, [["--toolbar-height", "72px"]]);

  styleCalls.length = 0;
  const rafCalls: Array<() => void> = [];
  const resizeHandlers: Array<() => void> = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ResizeObserver: undefined,
      requestAnimationFrame(callback: () => void) {
        rafCalls.push(callback);
        callback();
        return 1;
      },
      addEventListener(type: string, handler: () => void) {
        assert.equal(type, "resize");
        resizeHandlers.push(handler);
      },
    },
  });

  const toolbar2 = { offsetHeight: 64 };
  observeToolbarHeight(toolbar2 as any);
  assert.deepEqual(styleCalls, [["--toolbar-height", "64px"]]);
  assert.equal(resizeHandlers.length, 1);
  toolbar2.offsetHeight = 80;
  resizeHandlers[0]?.();
  assert.deepEqual(styleCalls.at(-1), ["--toolbar-height", "80px"]);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
