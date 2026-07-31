import assert from "node:assert/strict";
import {
  bindServiceWorkerRuntime,
  restoreLanguageParentPanel,
} from "../../../src/app/browser/browser-runtime.js";

const helpDialog = { id: "help-dialog" };
const savedDialog = { id: "saved-dialog" };
const ownerDocument = {
  querySelector(selector: string) {
    if (selector === "#help-dialog") return helpDialog;
    if (selector === "#saved-dialog") return savedDialog;
    return null;
  },
};

const directPanelCalls: any[] = [];
const directLanguageDialog = {
  dataset: { returnPanel: "help" },
  ownerDocument,
};
restoreLanguageParentPanel(
  {
    languageDialog: () => directLanguageDialog,
    languageList: () => [{ code: "en" }],
    syncUrlState() {},
  },
  (panelOptions: any) => directPanelCalls.push(panelOptions),
);
assert.equal(directLanguageDialog.dataset.returnPanel, undefined);
assert.equal(directPanelCalls.length, 1);

const directWarnings = { entries: [] as any[] };
const directWindowEvents: Record<string, () => unknown> = {};
const directRegistrations = [
  {
    scope: "https://emoji.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
  {
    scope: "https://other.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];
const directDeletedCaches: string[] = [];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: { getRegistrations: async () => directRegistrations },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      directWindowEvents[type] = handler;
    },
  } as any,
  cachesRef: {
    keys: async () => ["emoji-explorer-v1", "other-cache"],
    delete: async (name: string) => {
      directDeletedCaches.push(name);
      return true;
    },
  },
  isViteDevelopment: true,
  warn: (...args: any[]) => {
    directWarnings.entries = [...directWarnings.entries, args];
  },
});
await directWindowEvents.load?.();
assert.equal(directRegistrations[0].unregisterCalls, 1);
assert.equal(directRegistrations[1].unregisterCalls, 0);
assert.deepEqual(directDeletedCaches, ["emoji-explorer-v1"]);
assert.deepEqual(directWarnings.entries, []);

const installWindowEvents: Record<string, () => unknown> = {};
const installCalls: string[] = [];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      register: async (url: string) => {
        installCalls.push(url);
        return { scope: url };
      },
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      installWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: false,
});
await installWindowEvents.load?.();
assert.deepEqual(installCalls, ["./service-worker.js"]);
