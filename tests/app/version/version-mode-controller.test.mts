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
  input: { checked: boolean; tabIndex: number } | null = null;

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  querySelector() {
    return this.input;
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
  toggle.input = { checked: false, tabIndex: 0 };
  const translations: Array<[string, string]> = [];
  let renderCategoryFiltersCalls = 0;
  let drawListCalls = 0;
  let syncUrlStateCalls = 0;

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
    syncUrlState: () => {
      syncUrlStateCalls += 1;
    },
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
  assert.equal(toggle.input.checked, true);
  assert.equal(toggle.input.tabIndex, -1);

  controller.toggle({
    detail: 1,
    currentTarget: toggle,
  });
  assert.equal(selector.value, "through");
  assert.equal(toggle.attributes.get("aria-pressed"), "false");
  assert.equal(renderCategoryFiltersCalls, 1);
  assert.equal(drawListCalls, 1);
  assert.equal(syncUrlStateCalls, 1);
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

  const selectorWithoutInput = new FakeSelector();
  selectorWithoutInput.value = "through";
  const toggleWithoutInput = new FakeToggle();
  const noInputController = createVersionModeController({
    definitions: [{ value: "through", key: "through", fallback: "Through" }],
    drawList: () => {},
    renderCategoryFilters: () => {},
    selector: () => selectorWithoutInput,
    toggle: () => toggleWithoutInput,
    translate: (_key: string, fallback: string) => fallback,
  });
  assert.doesNotThrow(() => noInputController.render());
  assert.equal(toggleWithoutInput.attributes.get("aria-pressed"), "false");

  const selectorlessController = createVersionModeController({
    definitions: [{ value: "through", key: "through", fallback: "Through" }],
    drawList: () => {},
    renderCategoryFilters: () => {},
    translate: (_key: string, fallback: string) => fallback,
  });
  selectorlessController.populateOptions();
  selectorlessController.toggle({ preventDefault() {} });

  const selectorOnlyController = createVersionModeController({
    definitions: [{ value: "through", key: "through", fallback: "Through" }],
    drawList: () => {},
    renderCategoryFilters: () => {},
    selector: () => selectorWithUnknownValue,
    toggle: () => null,
    translate: (_key: string, fallback: string) => fallback,
  });
  assert.doesNotThrow(() => selectorOnlyController.render());

  Reflect.deleteProperty(globalThis, "document");
  const noDocumentController = createVersionModeController({
    definitions: [{ value: "through", key: "through", fallback: "Through" }],
    drawList: () => {},
    renderCategoryFilters: () => {},
    translate: (_key: string, fallback: string) => fallback,
  });
  assert.doesNotThrow(() => noDocumentController.populateOptions());
  assert.doesNotThrow(() => noDocumentController.render());
  assert.doesNotThrow(() => noDocumentController.toggle(undefined));
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        assert.equal(tagName, "option");
        return new FakeOption();
      },
    },
  });

  const queriedSelector = new FakeSelector();
  queriedSelector.value = "selected";
  const queriedToggle = new FakeToggle();
  queriedToggle.input = { checked: false, tabIndex: 0 };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        assert.equal(tagName, "option");
        return new FakeOption();
      },
      querySelector(selectorText: string) {
        if (selectorText === ".select-version-mode") return queriedSelector;
        if (selectorText === ".version-mode-toggle") return queriedToggle;
        return null;
      },
    },
  });
  const fallbackQueryController = createVersionModeController({
    definitions: [
      { value: "through", key: "allVersions", fallback: "All versions" },
      {
        value: "selected",
        key: "selectedVersionOnly",
        fallback: "Selected version only",
      },
    ],
    drawList: () => {},
    renderCategoryFilters: () => {},
    translate: (_key: string, fallback: string) => fallback,
  });
  fallbackQueryController.render();
  assert.equal(queriedToggle.attributes.get("aria-pressed"), "true");
  assert.equal(queriedToggle.input.checked, true);
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
