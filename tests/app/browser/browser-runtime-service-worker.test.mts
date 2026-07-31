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
const directSyncCalls: number[] = [];
const directLanguageDialog = {
  dataset: { returnPanel: "help" },
  ownerDocument,
};
restoreLanguageParentPanel(
  {
    languageDialog: () => directLanguageDialog,
    languageList: () => [{ code: "en" }],
    syncUrlState() {
      directSyncCalls.push(1);
    },
  },
  (panelOptions: any) => directPanelCalls.push(panelOptions),
);
assert.equal(directLanguageDialog.dataset.returnPanel, undefined);
assert.equal(directPanelCalls.length, 1);
assert.equal(directSyncCalls.length, 1);

const untouchedPanelCalls: any[] = [];
const untouchedSyncCalls: number[] = [];
const untouchedLanguageDialog = {
  dataset: { returnPanel: "favorites" },
  ownerDocument,
};
restoreLanguageParentPanel(
  {
    languageDialog: () => untouchedLanguageDialog,
    languageList: () => [{ code: "en" }],
    syncUrlState() {
      untouchedSyncCalls.push(1);
    },
  },
  (panelOptions: any) => untouchedPanelCalls.push(panelOptions),
);
assert.equal(untouchedLanguageDialog.dataset.returnPanel, undefined);
assert.equal(untouchedPanelCalls.length, 0);
assert.equal(untouchedSyncCalls.length, 0);

const defaultPanelCalls: any[] = [];
const defaultPanelDialog = {
  dataset: {},
  ownerDocument,
};
restoreLanguageParentPanel(
  {
    languageDialog: () => defaultPanelDialog,
    languageList: () => [{ code: "en" }],
    syncUrlState() {
      defaultPanelCalls.push("sync");
    },
  },
  (panelOptions: any) => defaultPanelCalls.push(panelOptions),
);
assert.equal(defaultPanelCalls.length, 2);
assert.equal(defaultPanelCalls[0].panel, "help");
assert.equal(defaultPanelCalls[1], "sync");

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
const installWarnings: any[] = [];
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
  warn: (...args: any[]) => {
    installWarnings.push(args);
  },
});
await installWindowEvents.load?.();
assert.deepEqual(installCalls, ["./service-worker.js"]);
assert.deepEqual(installWarnings, []);

const installFailureWindowEvents: Record<string, () => unknown> = {};
const installFailureWarnings: any[] = [];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      register: async () => {
        throw new Error("register-failed");
      },
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      installFailureWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: false,
  warn: (...args: any[]) => {
    installFailureWarnings.push(args);
  },
});
await installFailureWindowEvents.load?.();
assert.equal(installFailureWarnings.length, 1);
assert.equal(installFailureWarnings[0][0], "Offline support unavailable");

const devFailureWindowEvents: Record<string, () => unknown> = {};
const devFailureWarnings: any[] = [];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      getRegistrations: async () => {
        throw new Error("clear-failed");
      },
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      devFailureWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: true,
  warn: (...args: any[]) => {
    devFailureWarnings.push(args);
  },
});
await devFailureWindowEvents.load?.();
assert.equal(devFailureWarnings.length, 1);
assert.equal(devFailureWarnings[0][0], "Could not clear local offline cache");

const idleWindowEvents: Record<string, () => unknown> = {};
bindServiceWorkerRuntime({
  navigatorRef: { serviceWorker: {} } as any,
  windowRef: {
    isSecureContext: false,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      idleWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: false,
});
assert.deepEqual(Object.keys(idleWindowEvents), []);
