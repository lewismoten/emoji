import { describe, expect, it } from "vitest";

import {
  bindChoiceEvents,
  bindChoiceGroup,
  bindDeveloperModeToggleIfNeeded,
  bindInstallDialogClose,
  bindSavedDialogInteractionsIfPresent,
  bindSavedDialogInteractionsIfUnbound,
  createHelpAfterOpen,
  createLanguageBeforeOpen,
  ensureDataset,
  ensurePanelBound,
  getChoices,
  renderChoiceSelected,
  resolveLanguagePickerButton,
  resolveOption,
  syncDialogChoiceGroup,
} from "../../../src/app/emoji/explorer-app-events-helpers.js";

describe("explorer-app-events-helpers", () => {
  it("covers dataset, choice, dialog, and binding helpers", async () => {
    const createEventTarget = () => {
      const listeners = new Map<string, Function[]>();
      return {
        addEventListener(type: string, handler: Function) {
          const list = listeners.get(type) ?? [];
          list.push(handler);
          listeners.set(type, list);
        },
        listeners,
      };
    };

    const createChoice = (
      dataset: Record<string, string>,
      withInput = true,
    ) => {
      const input = {
        checked: false,
        defaultChecked: false,
        attributes: new Map<string, string>(),
        addEventListener() {},
        removeAttribute(name: string) {
          this.attributes.delete(name);
        },
        setAttribute(name: string, value: string) {
          this.attributes.set(name, value);
        },
      };
      const choice = {
        ...createEventTarget(),
        classStates: new Map<string, boolean>(),
        classList: {
          toggle(name: string, active: boolean) {
            this.owner.classStates.set(name, active);
          },
          owner: undefined as any,
        },
        attributes: new Map<string, string>(),
        dataset,
        querySelector(selector: string) {
          return selector === 'input[type="radio"]' && withInput ? input : null;
        },
        setAttribute(name: string, value: string) {
          this.attributes.set(name, value);
        },
        tabIndex: -1,
      };
      choice.classList.owner = choice;
      return choice;
    };

    const selectedChoice = createChoice({ theme: "dark", modeBound: "false" });
    const unselectedChoice = createChoice({
      theme: "light",
      modeBound: "false",
    });

    expect(resolveOption(undefined, "fallback")).toBe("fallback");
    expect(resolveOption(() => "resolved", "fallback")).toBe("resolved");

    expect(ensureDataset(undefined)).toBeUndefined();
    expect(ensureDataset("text")).toBeUndefined();
    const newDatasetTarget: any = {};
    expect(ensureDataset(newDatasetTarget)).toEqual({});
    expect(ensureDataset(newDatasetTarget)).toBe(newDatasetTarget.dataset);

    expect(getChoices(undefined, ".theme-choice")).toEqual([]);

    renderChoiceSelected("theme", "dark")(selectedChoice as any);
    expect(selectedChoice.classStates.get("is-active")).toBe(true);
    renderChoiceSelected("theme", "dark")(unselectedChoice as any);
    expect(unselectedChoice.classStates.get("is-active")).toBe(false);
    syncDialogChoiceGroup(
      { querySelectorAll: () => [selectedChoice, unselectedChoice] } as any,
      ".theme-choice",
      "theme",
      "dark",
    );

    const onKeyDown = () => {};
    const toggleCallback = () => {};
    const unboundChoice = createChoice({ modeBound: "false" });
    bindChoiceEvents(onKeyDown as any, toggleCallback)(unboundChoice as any);
    expect(unboundChoice.dataset.modeBound).toBe("true");
    bindChoiceGroup(
      {
        querySelectorAll: () => [
          createChoice({ modeBound: "false" }),
          createChoice({ modeBound: "false" }),
        ],
      } as any,
      ".theme-choice",
      toggleCallback,
      () => onKeyDown as any,
    );

    const directPicker = {} as any;
    expect(resolveLanguagePickerButton(directPicker, undefined)).toBe(
      directPicker,
    );
    expect(ensurePanelBound({} as any)).toBe(true);

    const panelCloses: any[] = [];
    const languageDialog: any = { dataset: {} };
    createLanguageBeforeOpen(
      () => ({ open: true }) as any,
      () => languageDialog,
      (...args: any[]) => panelCloses.push(args),
      "suppressed",
    )();
    expect(languageDialog.dataset.returnPanel).toBe("help");

    const helpLifecycleCalls: string[] = [];
    const themeChoice = createChoice({ theme: "dark" });
    const modeChoice = createChoice({ mode: "standard" });
    const helpDialog = {
      querySelectorAll(selector: string) {
        if (selector === ".theme-choice") return [themeChoice];
        if (selector === ".mode-choice") return [modeChoice];
        return [];
      },
    };
    await createHelpAfterOpen(
      { requestAnimationFrame: (callback: Function) => callback(), setTimeout },
      { documentElement: { dataset: { explorerMode: "standard" } } },
      {
        audioToggle: { render: () => helpLifecycleCalls.push("audio-render") },
        themes: { getTheme: () => "dark" },
      },
      {
        refreshElements: () => helpLifecycleCalls.push("refresh"),
        renderDeveloperMode: () => helpLifecycleCalls.push("mode"),
      },
      () => helpDialog as any,
    )();
    expect(helpLifecycleCalls).toEqual(["refresh", "mode", "audio-render"]);

    const savedDialogTarget: any = {};
    expect(
      bindSavedDialogInteractionsIfUnbound(
        savedDialogTarget,
        { id: "a" },
        () => undefined,
      ),
    ).toBe(true);
    expect(bindSavedDialogInteractionsIfPresent({}, {}, () => undefined)).toBe(
      true,
    );

    let installCloseHandler: Function | undefined;
    bindInstallDialogClose(
      { querySelector: () => ({}) as any },
      ((_: unknown, handler: () => void) => (
        (installCloseHandler = handler),
        () => {}
      )) as any,
    );
    installCloseHandler?.();
    expect(
      typeof bindDeveloperModeToggleIfNeeded([{}], {}, () => {}, (() =>
        () => {}) as any),
    ).toBe("function");
  });
});
