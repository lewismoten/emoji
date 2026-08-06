import { afterEach, describe, expect, it } from "vitest";

import { createVersionModeController } from "../../../src/app/version/version-mode-controller.js";
import { createVersionModeRuntime } from "../../../src/app/version/version-mode-runtime.js";

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

afterEach(() => {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
});

describe("version mode runtime", () => {
  it("manages selector options, toggle rendering, and fallback lookups", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement(tagName: string) {
          expect(tagName).toBe("option");
          return new FakeOption();
        },
      },
    });

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
    expect(selector.replacedChildren).toHaveLength(2);
    expect(selector.replacedChildren[0]?.value).toBe("through");
    expect(selector.replacedChildren[0]?.textContent).toBe("All versions!");
    expect(selector.replacedChildren[1]?.value).toBe("selected");
    expect(selector.replacedChildren[1]?.textContent).toBe(
      "Selected version only!",
    );
    expect(selector.value).toBe("selected");

    controller.render();
    expect(toggle.attributes.get("aria-pressed")).toBe("true");
    expect(toggle.attributes.get("aria-label")).toBe("Selected version only!");
    expect(toggle.title).toBe("Selected version only!");
    expect(toggle.input?.checked).toBe(true);
    expect(toggle.input?.tabIndex).toBe(-1);

    controller.toggle({
      detail: 1,
      currentTarget: toggle,
      preventDefault() {},
    });
    expect(selector.value).toBe("through");
    expect(toggle.attributes.get("aria-pressed")).toBe("false");
    expect(renderCategoryFiltersCalls).toBe(1);
    expect(drawListCalls).toBe(1);
    expect(syncUrlStateCalls).toBe(1);
    expect(toggle.blurCalls).toBe(1);

    controller.toggle({
      detail: 0,
      currentTarget: toggle,
      preventDefault() {},
    });
    expect(selector.value).toBe("selected");
    expect(toggle.blurCalls).toBe(1);

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
    expect(selectorWithUnknownValue.value).toBe("through");
    fallbackController.render();
    expect(translations.at(-1)).toEqual([
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
    expect(() => noInputController.render()).not.toThrow();
    expect(toggleWithoutInput.attributes.get("aria-pressed")).toBe("false");

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
    expect(() => selectorOnlyController.render()).not.toThrow();

    Reflect.deleteProperty(globalThis, "document");
    const noDocumentController = createVersionModeController({
      definitions: [{ value: "through", key: "through", fallback: "Through" }],
      drawList: () => {},
      renderCategoryFilters: () => {},
      translate: (_key: string, fallback: string) => fallback,
    });
    expect(() => noDocumentController.populateOptions()).not.toThrow();
    expect(() => noDocumentController.render()).not.toThrow();
    expect(() => noDocumentController.toggle(undefined)).not.toThrow();

    const queriedSelector = new FakeSelector();
    queriedSelector.value = "selected";
    const queriedToggle = new FakeToggle();
    queriedToggle.input = { checked: false, tabIndex: 0 };
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement(tagName: string) {
          expect(tagName).toBe("option");
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
    expect(queriedToggle.attributes.get("aria-pressed")).toBe("true");
    expect(queriedToggle.input?.checked).toBe(true);
  });

  it("wraps runtime option accessors around the controller contract", () => {
    let drawListValue = "draw-1";
    let renderCategoryFiltersValue = "render-1";
    let selectorValue = "selector-1";
    let toggleValue = "toggle-1";
    const syncUrlState = () => "synced";

    const runtime = createVersionModeRuntime({
      definitions: ["through", "selected"],
      drawList: () => drawListValue,
      renderCategoryFilters: () => renderCategoryFiltersValue,
      selector: () => selectorValue,
      syncUrlState,
      toggle: () => toggleValue,
      translate: "translate",
    });

    expect(runtime).toEqual(
      expect.objectContaining({
        populateOptions: expect.any(Function),
        render: expect.any(Function),
        toggle: expect.any(Function),
      }),
    );

    drawListValue = "draw-2";
    renderCategoryFiltersValue = "render-2";
    selectorValue = "selector-2";
    toggleValue = "toggle-2";

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        createElement() {
          return new FakeOption();
        },
      },
    });

    const proxiedSelector = {
      value: "through",
      replaceChildren() {},
    };
    const proxiedToggle = {
      setAttribute() {},
      title: "",
      querySelector() {
        return null;
      },
      blur() {},
    };
    const proxied = createVersionModeRuntime({
      definitions: [{ value: "through", key: "through", fallback: "Through" }],
      drawList: () => drawListValue,
      renderCategoryFilters: () => renderCategoryFiltersValue,
      selector: () => proxiedSelector,
      syncUrlState,
      toggle: () => proxiedToggle,
      translate: (_key: string, fallback: string) => fallback,
    });

    expect(() =>
      proxied.toggle({
        preventDefault() {},
        detail: 0,
        currentTarget: proxiedToggle,
      }),
    ).not.toThrow();
    expect(proxiedSelector.value).toBe("through");
  });
});
