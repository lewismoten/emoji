import type {
  PanelName,
  BrowserNavigator,
  InstallAppOptions,
  InstallAppResult,
  PanelDialogs,
  PanelContext,
  OpenPanelOptions
} from './pwa-types.js';
import { getPanelDialog } from "./pwa-get-panel-dialog.js";
export { bindPanelDialog } from "./pwa-bind-panel-dialog.js";
export { ensurePanelDialogLifecycleBound } from "./pwa-ensure-panel-dialog-lifecycle-bound.js";
export { getPanelDialog } from "./pwa-get-panel-dialog.js";
export { onPanelDialogClose } from "./pwa-on-panel-dialog-close.js";

export const getInstalledDisplayQueries = () => {
  if (typeof window === "undefined") return [];
  return [
    "standalone",
    "fullscreen",
    "minimal-ui",
    "window-controls-overlay",
  ].map((mode) => window.matchMedia(`(display-mode: ${mode})`));
};

export const isInstalledApp = () =>
  getInstalledDisplayQueries().some((query) => query.matches) ||
  (window.navigator as BrowserNavigator).standalone === true ||
  document.referrer.startsWith("android-app://");

export const isIosDevice = () => {
  const navigator = window.navigator as BrowserNavigator;
  const userAgent = navigator.userAgent;
  const clientPlatform = navigator.userAgentData?.platform;
  if (clientPlatform?.toLowerCase() === "macos") return false;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) &&
      /Mobile/.test(userAgent) &&
      navigator.maxTouchPoints > 1)
  );
};

export function renderInstallAppButton(
  installAppButton: HTMLElement | undefined,
) {
  if (!installAppButton) return;
  installAppButton.hidden = isInstalledApp();
}

export function updateWebAppManifest(locale = "") {
  const manifest = document.querySelector<HTMLLinkElement>(
    'link[rel="manifest"]',
  );
  if (!manifest) return;
  const href = locale
    ? `./manifest.${locale}.webmanifest`
    : "./manifest.webmanifest";
  if (manifest.getAttribute("href") !== href)
    manifest.setAttribute("href", href);
}

function isInstallPromptCancellation(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "AbortError"
  ) {
    return true;
  }
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes("cancel");
}

export async function installApp({
  deferredInstallPrompt,
  event,
  installDialog,
  renderInstallAppButton,
}: InstallAppOptions): Promise<InstallAppResult> {
  const trigger =
    event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  const releaseTriggerFocus = (event?.detail ?? 0) > 0;
  const promptEvent = deferredInstallPrompt;
  if (!promptEvent) {
    const ios = isIosDevice();
    const iosInstructions = installDialog?.querySelector<HTMLElement>(
      ".install-instructions-ios",
    );
    const browserInstructions = installDialog?.querySelector<HTMLElement>(
      ".install-instructions-browser",
    );
    if (iosInstructions) iosInstructions.hidden = !ios;
    if (browserInstructions) browserInstructions.hidden = ios;
    installDialog?.showModal();
    return { deferredInstallPrompt };
  }
  renderInstallAppButton();
  try {
    await promptEvent.prompt();
    await promptEvent.userChoice;
  } catch (error) {
    if (!isInstallPromptCancellation(error))
      console.warn("App installation unavailable", error);
  }
  if (releaseTriggerFocus) trigger?.blur?.();
  return { deferredInstallPrompt: undefined };
}

export function getOpenPanel(dialogs: PanelDialogs): PanelName {
  const isPanelOpen = (dialog: HTMLDialogElement | undefined) =>
    Boolean(dialog?.open && dialog.dataset.panelClosing !== "true");
  if (isPanelOpen(dialogs.favorites)) return "favorites";
  if (isPanelOpen(dialogs.help)) return "help";
  if (isPanelOpen(dialogs.language)) return "language";
  if (isPanelOpen(dialogs.filters)) return "filters";
  return "";
}

export function focusPanelDialog(
  panel: Exclude<PanelName, "">,
  dialog: HTMLDialogElement,
  { languageList, renderSavedEmoji }: PanelContext,
) {
  if (panel === "favorites") {
    renderSavedEmoji();
    (
      dialog.querySelector<HTMLElement>(".saved-emoji-list button") ??
      dialog.querySelector<HTMLElement>(".dialog-close")
    )?.focus();
  } else if (panel === "language") {
    (
      languageList?.querySelector<HTMLElement>(".is-selected") ??
      dialog.querySelector<HTMLElement>(".dialog-close")
    )?.focus();
  } else if (panel === "filters") {
    (
      dialog.querySelector<HTMLElement>(
        ".version-mode-toggle, .compact-choice, .modifier-filters label, .dialog-close",
      ) ?? dialog.querySelector<HTMLElement>(".dialog-close")
    )?.focus();
  } else {
    dialog.querySelector<HTMLElement>(".dialog-close")?.focus();
  }
}

export function openPanelDialog({
  addHistory = true,
  panel,
  syncUrlState,
  ...context
}: OpenPanelOptions) {
  if (!context.dialogs) return;
  const dialog = getPanelDialog(panel, context.dialogs);
  if (!dialog) return;
  delete dialog.dataset.panelClosing;
  if (!dialog.open) dialog.showModal();
  focusPanelDialog(panel, dialog, context);
  if (addHistory) {
    syncUrlState("push", { ...window.history.state, panelDialogEntry: true });
  }
}

export function closePanelDialog(
  dialog: HTMLDialogElement | undefined,
  suppressedPanelCloses: WeakSet<HTMLDialogElement>,
) {
  if (!dialog?.open) return;
  suppressedPanelCloses.add(dialog);
  dialog.close();
}
