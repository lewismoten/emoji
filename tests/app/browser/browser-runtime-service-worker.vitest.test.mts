import { describe, expect, it } from "vitest";

import {
  bindServiceWorkerRuntime,
  restoreLanguageParentPanel,
} from "../../../src/app/browser/browser-runtime.js";

describe("browser runtime service worker helpers", () => {
  it("restores the language parent panel for help and defaults", () => {
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
    expect(directLanguageDialog.dataset.returnPanel).toBeUndefined();
    expect(directPanelCalls).toHaveLength(1);
    expect(directSyncCalls).toHaveLength(1);

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
    expect(untouchedLanguageDialog.dataset.returnPanel).toBeUndefined();
    expect(untouchedPanelCalls).toHaveLength(0);
    expect(untouchedSyncCalls).toHaveLength(0);

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
    expect(defaultPanelCalls).toHaveLength(2);
    expect(defaultPanelCalls[0].panel).toBe("help");
    expect(defaultPanelCalls[1]).toBe("sync");

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
    expect(missingDialogCalls).toHaveLength(2);
    expect(missingDialogCalls[0].panel).toBe("help");
    expect(missingDialogCalls[0].dialogs.language).toBeNull();
    expect(missingDialogCalls[1]).toBe("sync");
  });

  it("cleans caches in dev/local preview and registers in production", async () => {
    const directWarnings: any[] = [];
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
        location: {
          origin: "https://emoji.example",
          hostname: "emoji.example",
        },
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
        directWarnings.push(args);
      },
    });
    await directWindowEvents.load?.();
    expect(directRegistrations[0].unregisterCalls).toBe(1);
    expect(directRegistrations[1].unregisterCalls).toBe(0);
    expect(directDeletedCaches).toEqual(["emoji-explorer-v1"]);
    expect(directWarnings).toEqual([]);

    const cleanupFailureWindowEvents: Record<string, () => unknown> = {};
    const cleanupFailureWarnings: any[] = [];
    bindServiceWorkerRuntime({
      navigatorRef: {
        serviceWorker: {
          getRegistrations: async () => {
            throw new Error("cleanup-failed");
          },
        },
      } as any,
      windowRef: {
        isSecureContext: true,
        location: {
          origin: "https://emoji.example",
          hostname: "emoji.example",
        },
        addEventListener(type: string, handler: () => unknown) {
          cleanupFailureWindowEvents[type] = handler;
        },
      } as any,
      cachesRef: {
        keys: async () => ["emoji-explorer-v1"],
        delete: async () => true,
      },
      isViteDevelopment: true,
      warn: (...args: any[]) => {
        cleanupFailureWarnings.push(args);
      },
    });
    await cleanupFailureWindowEvents.load?.();
    expect(cleanupFailureWarnings).toHaveLength(1);
    expect(cleanupFailureWarnings[0][0]).toBe(
      "Could not clear local offline cache",
    );

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
        location: {
          origin: "https://emoji.example",
          hostname: "emoji.example",
        },
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
    expect(installCalls).toEqual(["./service-worker.js"]);
    expect(installWarnings).toEqual([]);

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
        location: {
          origin: "https://emoji.example",
          hostname: "emoji.example",
        },
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
    expect(installFailureWarnings).toHaveLength(1);
    expect(installFailureWarnings[0][0]).toBe("Offline support unavailable");

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
        },
      } as any,
      windowRef: {
        isSecureContext: true,
        location: {
          origin: "http://127.0.0.1:4173",
          hostname: "127.0.0.1",
        },
        addEventListener(type: string, handler: () => unknown) {
          localPreviewWindowEvents[type] = handler;
        },
      } as any,
      cachesRef: {
        keys: async () => ["emoji-explorer-preview"],
        delete: async (name: string) => {
          localPreviewDeletedCaches.push(name);
          return true;
        },
      },
      isViteDevelopment: false,
      warn() {},
    });
    await localPreviewWindowEvents.load?.();
    expect(localPreviewRegistrations[0].unregisterCalls).toBe(1);
    expect(localPreviewDeletedCaches).toEqual(["emoji-explorer-preview"]);
  });
});
