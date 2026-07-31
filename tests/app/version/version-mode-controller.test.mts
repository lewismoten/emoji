import assert from "node:assert/strict";
import { createVersionModeController } from "../../../src/app/version/version-mode-controller.js";

class FakeOption {
  value = "";
  textContent = "";
}

class FakeToggle {
  attributes = new Map<string, string>();
  title = "";
  blurCalls = 0;

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  blur() {
    this.blurCalls += 1;
  }
}

class FakeSelector {
  value = "";
  replacedChildren: FakeOption[] = [];

  replaceChildren(...children: FakeOption[]) {
    this.replacedChildren = children;
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    createElement(tagName: string) {
      assert.equal(tagName, "option");
      return new FakeOption();
    },
  },
});

try {
  const selector = new FakeSelector();
  selector.value = "selected";
  const toggle = new FakeToggle();
  const translations: Array<[string, string]> = [];
  let renderCategoryFiltersCalls = 0;
  let drawListCalls = 0;

  const controller = createVersionModeController({
    definitions: [
      { value: "through", key: "allVersions", fallback: "All versions" },
      {
        value: "selected",
        key: "selectedVersionOnly",
        fallback: "Selected version only",
      },
    ],
    drawList: () => {
      drawListCalls += 1;
    },
    renderCategoryFilters: () => {
      renderCategoryFiltersCalls += 1;
    },
    selector: () => selector,
    toggle: () => toggle,
    translate: (key: string, fallback: string) => {
      translations.push([key, fallback]);
      return `${fallback}!`;
    },
  });

  controller.populateOptions();
  assert.equal(selector.replacedChildren.length, 2);
  assert.equal(selector.replacedChildren[0]?.value, "through");
  assert.equal(selector.replacedChildren[0]?.textContent, "All versions!");
  assert.equal(selector.replacedChildren[1]?.value, "selected");
  assert.equal(
    selector.replacedChildren[1]?.textContent,
    "Selected version only!",
  );
  assert.equal(selector.value, "selected");

  controller.render();
  assert.equal(toggle.attributes.get("aria-pressed"), "true");
  assert.equal(toggle.attributes.get("aria-label"), "Selected version only!");
  assert.equal(toggle.title, "Selected version only!");

  controller.toggle({
    detail: 1,
    currentTarget: toggle,
  });
  assert.equal(selector.value, "through");
  assert.equal(toggle.attributes.get("aria-pressed"), "false");
  assert.equal(renderCategoryFiltersCalls, 1);
  assert.equal(drawListCalls, 1);
  assert.equal(toggle.blurCalls, 1);

  controller.toggle({
    detail: 0,
    currentTarget: toggle,
  });
  assert.equal(selector.value, "selected");
  assert.equal(toggle.blurCalls, 1);

  const selectorWithUnknownValue = new FakeSelector();
  selectorWithUnknownValue.value = "unknown";
  const fallbackController = createVersionModeController({
    definitions: [{ value: "through", key: "through", fallback: "Through" }],
    drawList: () => {},
    renderCategoryFilters: () => {},
    selector: () => selectorWithUnknownValue,
    toggle: () => null,
    translate: (_key: string, fallback: string) => fallback,
  });
  fallbackController.populateOptions();
  assert.equal(selectorWithUnknownValue.value, "through");
  fallbackController.render();
  assert.deepEqual(translations.at(-1), [
    "selectedVersionOnly",
    "Selected version only",
  ]);
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
