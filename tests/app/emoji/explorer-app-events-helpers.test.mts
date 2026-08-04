import assert from "node:assert/strict";
import {
  bindChoiceEvents,
  bindChoiceGroup,
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

const createChoice = (dataset: Record<string, string>, withInput = true) => {
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
const unselectedChoice = createChoice({ theme: "light", modeBound: "false" });
selectedChoice.classList.owner = selectedChoice;
unselectedChoice.classList.owner = unselectedChoice;

assert.equal(resolveOption(undefined, "fallback"), "fallback");
assert.equal(
  resolveOption(() => "resolved", "fallback"),
  "resolved",
);

assert.equal(ensureDataset(undefined), undefined);
assert.equal(ensureDataset("text"), undefined);
const newDatasetTarget: any = {};
assert.deepEqual(ensureDataset(newDatasetTarget), {});
assert.equal(ensureDataset(newDatasetTarget), newDatasetTarget.dataset);
const existingDataset = { dataset: { keep: "yes" } };
assert.equal(ensureDataset(existingDataset), existingDataset.dataset);

assert.deepEqual(getChoices(undefined, ".theme-choice"), []);
assert.deepEqual(
  getChoices(
    {
      querySelectorAll: ((selector: string) =>
        selector === ".theme-choice"
          ? [selectedChoice, unselectedChoice]
          : []) as any,
    },
    ".theme-choice",
  ),
  [selectedChoice, unselectedChoice],
);

renderChoiceSelected("theme", "dark")(selectedChoice as any);
assert.equal(selectedChoice.classStates.get("is-active"), true);
assert.equal(selectedChoice.attributes.get("aria-pressed"), "true");
assert.equal(selectedChoice.attributes.get("aria-checked"), "true");
assert.equal(selectedChoice.tabIndex, 0);
assert.equal(
  selectedChoice
    .querySelector('input[type="radio"]')
    ?.attributes.get("checked"),
  "checked",
);

renderChoiceSelected("theme", "dark")(unselectedChoice as any);
assert.equal(unselectedChoice.classStates.get("is-active"), false);
assert.equal(unselectedChoice.attributes.get("aria-pressed"), "false");
assert.equal(unselectedChoice.attributes.get("aria-checked"), "false");
assert.equal(unselectedChoice.tabIndex, -1);
assert.equal(
  unselectedChoice
    .querySelector('input[type="radio"]')
    ?.attributes.has("checked"),
  false,
);
renderChoiceSelected(
  "theme",
  "dark",
)(createChoice({ theme: "dark" }, false) as any);

syncDialogChoiceGroup(undefined, ".theme-choice", "theme", "dark");
syncDialogChoiceGroup(
  {
    querySelectorAll: (() => [selectedChoice, unselectedChoice]) as any,
  },
  ".theme-choice",
  "theme",
  "dark",
);

const onKeyDown = () => {};
const toggleCallback = () => {};
const unboundChoice = createChoice({ modeBound: "false" });
const boundChoice = createChoice({ modeBound: "true" });
bindChoiceEvents(onKeyDown as any, toggleCallback)(unboundChoice as any);
assert.equal(unboundChoice.dataset.modeBound, "true");
assert.equal(unboundChoice.listeners.get("click")?.[0], toggleCallback);
assert.equal(unboundChoice.listeners.get("keydown")?.[0], onKeyDown);
bindChoiceEvents(onKeyDown as any, toggleCallback)(boundChoice as any);
assert.equal(boundChoice.listeners.size, 0);

const keydownCalls: any[] = [];
bindChoiceGroup(
  undefined,
  ".theme-choice",
  toggleCallback,
  () => ((event: unknown) => keydownCalls.push(event)) as any,
);
bindChoiceGroup(
  {
    querySelectorAll: (() => [
      createChoice({ modeBound: "false" }),
      createChoice({ modeBound: "false" }),
    ]) as any,
  },
  ".theme-choice",
  toggleCallback,
  (choices: any[]) => {
    assert.equal(choices.length, 2);
    return onKeyDown as any;
  },
);

const directPicker = {} as any;
assert.equal(
  resolveLanguagePickerButton(directPicker, undefined),
  directPicker,
);
assert.equal(
  resolveLanguagePickerButton(() => directPicker, undefined),
  directPicker,
);
assert.equal(
  resolveLanguagePickerButton(undefined, {
    querySelector: ((selector: string) =>
      selector === ".language-picker" ? directPicker : null) as any,
  } as any),
  directPicker,
);
assert.equal(resolveLanguagePickerButton(undefined, undefined), undefined);

const unboundButton = {} as any;
assert.equal(ensurePanelBound(unboundButton), true);
assert.deepEqual(unboundButton.dataset, { panelBound: "true" });
assert.equal(ensurePanelBound(unboundButton), false);
assert.equal(
  ensurePanelBound({ dataset: { panelBound: "true" } } as any),
  false,
);

const panelCloses: any[] = [];
const languageDialog: any = { dataset: {} };
createLanguageBeforeOpen(
  () => ({ open: true }) as any,
  () => languageDialog,
  (...args: any[]) => panelCloses.push(args),
  "suppressed",
)();
assert.equal(languageDialog.dataset.returnPanel, "help");
assert.equal(panelCloses.length, 1);
languageDialog.dataset.returnPanel = "help";
createLanguageBeforeOpen(
  () => ({ open: false }) as any,
  () => languageDialog,
  () => panelCloses.push("closed"),
  "suppressed",
)();
assert.equal("returnPanel" in languageDialog.dataset, false);
createLanguageBeforeOpen(
  () => undefined,
  () => undefined,
  () => panelCloses.push("closed"),
  "suppressed",
)();

const helpLifecycleCalls: string[] = [];
const themeChoice = createChoice({ theme: "dark" });
const modeChoice = createChoice({ mode: "standard" });
themeChoice.classList.owner = themeChoice;
modeChoice.classList.owner = modeChoice;
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
    renderThemeToggle: () => helpLifecycleCalls.push("theme"),
  },
  () => helpDialog as any,
)();
assert.deepEqual(helpLifecycleCalls, [
  "refresh",
  "mode",
  "theme",
  "audio-render",
]);

await createHelpAfterOpen(
  { setTimeout } as any,
  undefined,
  { audioToggle: { render() {} }, themes: { getTheme: () => "light" } },
  {},
  () => undefined,
)();
await createHelpAfterOpen(
  undefined,
  undefined,
  { audioToggle: { render() {} }, themes: { getTheme: () => "light" } },
  {},
  () => undefined,
)();
