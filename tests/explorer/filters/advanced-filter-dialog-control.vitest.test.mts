import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const triggerCreate = vi.fn();
const dialogCreate = vi.fn();

vi.mock(
  "../../../src/controls/filters/pickers/advanced-filters-trigger.js",
  () => ({
    AdvancedFiltersTriggerControl: {
      create: triggerCreate,
    },
  }),
);

vi.mock(
  "../../../src/controls/dialog/content/advanced-filters-dialog.js",
  () => ({
    AdvancedFiltersDialogControl: {
      create: dialogCreate,
    },
  }),
);

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

const loadModule = async () =>
  import("../../../src/explorer/filters/advanced-filter-dialog-control.js");

describe("advanced-filter-dialog-control", () => {
  beforeEach(() => {
    triggerCreate.mockReset();
    dialogCreate.mockReset();
  });

  afterEach(() => {
    vi.resetModules();
    if (originalDocument) {
      Object.defineProperty(globalThis, "document", originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, "document");
    }
  });

  it("creates trigger and dialog controls from their factories", async () => {
    const trigger = { kind: "advanced-trigger" };
    const body = { className: "advanced-filters-dialog-body" };
    const grid = { className: "filter-grid" };
    const modifiers = { className: "modifier-filters" };
    const dialog = {
      className: "advanced-filters-dialog",
      id: "advanced-filters-dialog",
      querySelector(selector: string) {
        if (selector === ".advanced-filters-dialog-body") return body;
        if (selector === ".filter-grid") return grid;
        if (selector === ".modifier-filters") return modifiers;
        return null;
      },
    };

    triggerCreate.mockReturnValue(trigger);
    dialogCreate.mockReturnValue(dialog);

    const module = await loadModule();

    expect(module.createAdvancedFiltersTriggerControl()).toBe(trigger);
    await expect(module.createAdvancedFiltersDialogControl()).resolves.toEqual({
      body,
      dialog,
      grid,
      modifiers,
    });
  });

  it("throws when the dialog body is missing", async () => {
    dialogCreate.mockReturnValue({
      querySelector(selector: string) {
        if (selector === ".advanced-filters-dialog-body") return null;
        if (selector === ".filter-grid") return { className: "filter-grid" };
        if (selector === ".modifier-filters") {
          return { className: "modifier-filters" };
        }
        return null;
      },
    });

    const module = await loadModule();

    await expect(module.createAdvancedFiltersDialogControl()).rejects.toThrow(
      "Advanced filters dialog body was not created.",
    );
  });

  it("throws when the dialog content is incomplete", async () => {
    dialogCreate.mockReturnValue({
      querySelector(selector: string) {
        if (selector === ".advanced-filters-dialog-body") {
          return { className: "advanced-filters-dialog-body" };
        }
        if (selector === ".filter-grid") return null;
        if (selector === ".modifier-filters") {
          return { className: "modifier-filters" };
        }
        return null;
      },
    });

    const module = await loadModule();

    await expect(module.createAdvancedFiltersDialogControl()).rejects.toThrow(
      "Advanced filters dialog content was not created.",
    );
  });

  it("ensures the trigger and dialog are added only when missing", async () => {
    const prepended: unknown[] = [];
    const appended: unknown[] = [];
    const trigger = { kind: "advanced-trigger" };
    const dialog = {
      className: "advanced-filters-dialog",
      querySelector(selector: string) {
        if (selector === ".advanced-filters-dialog-body") {
          return { className: "advanced-filters-dialog-body" };
        }
        if (selector === ".filter-grid") return { className: "filter-grid" };
        if (selector === ".modifier-filters") {
          return { className: "modifier-filters" };
        }
        return null;
      },
    };
    const filterOptions = {
      prepend(node: unknown) {
        prepended.push(node);
      },
      querySelector(selector: string) {
        return selector === ".advanced-filters-trigger" ? null : null;
      },
    };
    const main = {
      append(node: unknown) {
        appended.push(node);
      },
    };

    triggerCreate.mockReturnValue(trigger);
    dialogCreate.mockReturnValue(dialog);

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === ".filter-options") return filterOptions;
          if (selector === "main") return main;
          if (selector === ".advanced-filters-dialog") return null;
          return null;
        },
      },
    });

    const module = await loadModule();

    module.ensureAdvancedFilterControls();
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(prepended).toEqual([trigger]);
    expect(appended).toEqual([dialog]);

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === ".filter-options") {
            return {
              prepend(node: unknown) {
                prepended.push(node);
              },
              querySelector(innerSelector: string) {
                return innerSelector === ".advanced-filters-trigger"
                  ? { className: "advanced-filters-trigger" }
                  : null;
              },
            };
          }
          if (selector === "main") return main;
          if (selector === ".advanced-filters-dialog") {
            return { className: "advanced-filters-dialog" };
          }
          return null;
        },
      },
    });

    module.ensureAdvancedFilterControls();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(prepended).toEqual([trigger]);
    expect(appended).toEqual([dialog]);
  });
});
