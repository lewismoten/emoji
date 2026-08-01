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
  (panelOptions: any) => {
    directPanelCalls.push(panelOptions);
    panelOptions.renderSavedEmoji();
  },
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
  (panelOptions: any) => {
    defaultPanelCalls.push(panelOptions);
    panelOptions.renderSavedEmoji();
  },
);
assert.equal(defaultPanelCalls.length, 2);
assert.equal(defaultPanelCalls[0].panel, "help");
assert.equal(defaultPanelCalls[1], "sync");

const missingDialogCalls: any[] = [];
restoreLanguageParentPanel(
  {
    languageDialog: () => null,
    languageList: () => [{ code: "en" }],
    syncUrlState() {
      missingDialogCalls.push("sync");
    },
  },
  (panelOptions: any) => {
    missingDialogCalls.push(panelOptions);
    panelOptions.renderSavedEmoji();
  },
);
assert.equal(missingDialogCalls.length, 2);
assert.equal(missingDialogCalls[0].panel, "help");
assert.equal(missingDialogCalls[0].dialogs.language, null);
assert.equal(missingDialogCalls[1], "sync");

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

const localPreviewWindowEvents: Record<string, () => unknown> = {};
const localPreviewRegistrations = [
  {
    scope: "http://127.0.0.1:4173/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];
const localPreviewDeletedCaches: string[] = [];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      getRegistrations: async () => localPreviewRegistrations,
      register: async () => {
        throw new Error("should-not-register-on-local-preview");
      },
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "http://127.0.0.1:4173", hostname: "127.0.0.1" },
    addEventListener(type: string, handler: () => unknown) {
      localPreviewWindowEvents[type] = handler;
    },
  } as any,
  cachesRef: {
    keys: async () => ["emoji-explorer-local", "unrelated-cache"],
    delete: async (name: string) => {
      localPreviewDeletedCaches.push(name);
      return true;
    },
  },
  isViteDevelopment: false,
});
await localPreviewWindowEvents.load?.();
assert.equal(localPreviewRegistrations[0].unregisterCalls, 1);
assert.deepEqual(localPreviewDeletedCaches, ["emoji-explorer-local"]);

const localhostWindowEvents: Record<string, () => unknown> = {};
const localhostRegistrations = [
  {
    scope: "http://localhost:4173/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      getRegistrations: async () => localhostRegistrations,
      register: async () => {
        throw new Error("should-not-register-on-localhost-preview");
      },
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "http://localhost:4173", hostname: "localhost" },
    addEventListener(type: string, handler: () => unknown) {
      localhostWindowEvents[type] = handler;
    },
  } as any,
  cachesRef: {
    keys: async () => [],
    delete: async () => true,
  },
  isViteDevelopment: false,
});
await localhostWindowEvents.load?.();
assert.equal(localhostRegistrations[0].unregisterCalls, 1);

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

const devNoCacheWindowEvents: Record<string, () => unknown> = {};
const devNoCacheRegistrations = [
  {
    scope: "https://emoji.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      getRegistrations: async () => devNoCacheRegistrations,
    },
  } as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      devNoCacheWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: true,
});
await devNoCacheWindowEvents.load?.();
assert.equal(devNoCacheRegistrations[0].unregisterCalls, 1);

const unsupportedWindowEvents: Record<string, () => unknown> = {};
bindServiceWorkerRuntime({
  navigatorRef: {} as any,
  windowRef: {
    isSecureContext: true,
    location: { origin: "https://emoji.example", hostname: "emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      unsupportedWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: false,
});
assert.deepEqual(unsupportedWindowEvents, {});

const insecureWindowEvents: Record<string, () => unknown> = {};
bindServiceWorkerRuntime({
  navigatorRef: {
    serviceWorker: {
      register: async () => ({ scope: "noop" }),
    },
  } as any,
  windowRef: {
    isSecureContext: false,
    location: { origin: "https://emoji.example", hostname: "emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      insecureWindowEvents[type] = handler;
    },
  } as any,
  isViteDevelopment: false,
});
assert.deepEqual(insecureWindowEvents, {});

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalCachesDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "caches",
);
const globalWindowEvents: Record<string, () => unknown> = {};
const globalRegistrations = [
  {
    scope: "https://emoji.example/app/",
    unregisterCalls: 0,
    unregister() {
      this.unregisterCalls += 1;
      return Promise.resolve(true);
    },
  },
];
const globalDeletedCaches: string[] = [];
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    isSecureContext: true,
    location: { origin: "https://emoji.example", hostname: "emoji.example" },
    addEventListener(type: string, handler: () => unknown) {
      globalWindowEvents[type] = handler;
    },
  },
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    serviceWorker: {
      getRegistrations: async () => globalRegistrations,
    },
  },
});
Object.defineProperty(globalThis, "caches", {
  configurable: true,
  value: {
    keys: async () => ["emoji-explorer-global", "other-global-cache"],
    delete: async (name: string) => {
      globalDeletedCaches.push(name);
      return true;
    },
  },
});
try {
  bindServiceWorkerRuntime({ isViteDevelopment: true });
  await globalWindowEvents.load?.();
  assert.equal(globalRegistrations[0].unregisterCalls, 1);
  assert.deepEqual(globalDeletedCaches, ["emoji-explorer-global"]);
} finally {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  } else {
    delete (globalThis as any).window;
  }
  if (originalNavigatorDescriptor) {
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  } else {
    delete (globalThis as any).navigator;
  }
  if (originalCachesDescriptor) {
    Object.defineProperty(globalThis, "caches", originalCachesDescriptor);
  } else {
    delete (globalThis as any).caches;
  }
}

Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: undefined,
});
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: undefined,
});
Object.defineProperty(globalThis, "caches", {
  configurable: true,
  value: undefined,
});
try {
  bindServiceWorkerRuntime({ isViteDevelopment: true });
} finally {
  if (originalWindowDescriptor) {
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  } else {
    delete (globalThis as any).window;
  }
  if (originalNavigatorDescriptor) {
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  } else {
    delete (globalThis as any).navigator;
  }
  if (originalCachesDescriptor) {
    Object.defineProperty(globalThis, "caches", originalCachesDescriptor);
  } else {
    delete (globalThis as any).caches;
  }
}

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
