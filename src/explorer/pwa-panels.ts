type BrowserNavigator = Navigator & {
  standalone?: boolean;
  userAgentData?: { platform?: string };
};

type BeforeInstallPromptEventLike = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<unknown>;
};

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

type InstallAppOptions = {
  deferredInstallPrompt: BeforeInstallPromptEventLike | undefined;
  event?: Event & { currentTarget?: EventTarget | null; detail?: number };
  installDialog?: HTMLDialogElement;
  renderInstallAppButton: () => void;
};

type InstallAppResult = {
  deferredInstallPrompt: BeforeInstallPromptEventLike | undefined;
};

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

type PanelName = "" | "favorites" | "help" | "language" | "filters";

type PanelDialogs = {
  filters?: HTMLDialogElement;
  favorites?: HTMLDialogElement;
  help?: HTMLDialogElement;
  language?: HTMLDialogElement;
};

type PanelContext = {
  dialogs?: PanelDialogs;
  languageList?: HTMLElement;
  renderSavedEmoji: () => void;
};

type SyncUrlState = (
  mode?: "replace" | "push",
  historyState?: Record<string, unknown>,
) => void;

export function getPanelDialog(panel: PanelName, dialogs: PanelDialogs) {
  const dialogMap: Record<
    Exclude<PanelName, "">,
    HTMLDialogElement | undefined
  > = {
    filters: dialogs.filters,
    favorites: dialogs.favorites,
    help: dialogs.help,
    language: dialogs.language,
  };
  return panel ? dialogMap[panel] : undefined;
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

type OpenPanelOptions = PanelContext & {
  addHistory?: boolean;
  panel: Exclude<PanelName, "">;
  syncUrlState: SyncUrlState;
};

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

function getPanelNameFromDialog(
  dialog: HTMLDialogElement | null,
): PanelName {
  if (!dialog) return "";
  if (dialog.classList.contains("saved-dialog")) return "favorites";
  if (dialog.classList.contains("help-dialog")) return "help";
  if (dialog.classList.contains("language-dialog")) return "language";
  if (dialog.classList.contains("advanced-filters-dialog")) return "filters";
  return "";
}

type ClosePanelOptions = {
  applyingUrlState: boolean;
  event: Event;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: SyncUrlState;
  urlStateReady: boolean;
};

export function onPanelDialogClose({
  applyingUrlState,
  event,
  suppressedPanelCloses,
  syncUrlState,
  urlStateReady,
}: ClosePanelOptions) {
  const dialog =
    event.currentTarget instanceof HTMLDialogElement
      ? event.currentTarget
      : null;
  if (
    (dialog && suppressedPanelCloses.delete(dialog)) ||
    !urlStateReady ||
    applyingUrlState
  )
    return;
  if (dialog?.dataset) dialog.dataset.panelClosing = "true";
  const closingPanel = getPanelNameFromDialog(dialog);
  const syncAfterClose = () => {
    if (window.history.state?.panelDialogEntry) {
      const nextState =
        window.history.state &&
        typeof window.history.state === "object" &&
        !Array.isArray(window.history.state)
          ? { ...window.history.state }
          : {};
      delete nextState.panelDialogEntry;
      syncUrlState("replace", nextState);
    } else {
      syncUrlState();
    }
    if (typeof window !== "undefined" && closingPanel) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("panel") === closingPanel) {
        params.delete("panel");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }
    if (dialog?.dataset) delete dialog.dataset.panelClosing;
  };
  if (typeof window !== "undefined" && window.requestAnimationFrame) {
    window.requestAnimationFrame(syncAfterClose);
    return;
  }
  syncAfterClose();
}

type BindPanelDialogOptions = PanelContext & {
  applyingUrlState: () => boolean;
  button?: HTMLElement;
  dialog?: HTMLDialogElement;
  dialogs?: PanelDialogs;
  ensureDialog?: () => Promise<void> | void;
  getDialog?: () => HTMLDialogElement | undefined;
  getDialogs?: () => PanelDialogs;
  getLanguageList?: () => HTMLElement | undefined;
  onBeforeOpen?: () => void;
  onAfterClose?: () => void;
  onAfterOpen?: () => Promise<void> | void;
  openPanel: (options: OpenPanelOptions) => void;
  panel: Exclude<PanelName, "">;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: SyncUrlState;
  urlStateReady: () => boolean;
};

type EnsurePanelDialogLifecycleBoundOptions = {
  applyingUrlState: () => boolean;
  dialog?: HTMLDialogElement;
  onAfterClose?: () => void;
  panel: Exclude<PanelName, "">;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: SyncUrlState;
  urlStateReady: () => boolean;
};

export function ensurePanelDialogLifecycleBound(
  options: EnsurePanelDialogLifecycleBoundOptions,
) {
  const dialog = options.dialog;
  if (!dialog) return;

  const clearPanelParam = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("panel") !== options.panel) return;
    params.delete("panel");
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  const markPanelClosing = () => {
    if (dialog.dataset) dialog.dataset.panelClosing = "true";
  };

  const closeButton = dialog.querySelector<HTMLElement>(".dialog-close");
  if (closeButton && closeButton.dataset.panelDismissBound !== "true") {
    closeButton.dataset.panelDismissBound = "true";
    const handleDismiss = () => {
      markPanelClosing();
      clearPanelParam();
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(clearPanelParam);
        return;
      }
      clearPanelParam();
    };
    closeButton.addEventListener("click", handleDismiss);
    closeButton.closest("form")?.addEventListener("submit", handleDismiss);
  }

  if (dialog.dataset.panelCloseBound === "true") return;
  dialog.dataset.panelCloseBound = "true";
  dialog.addEventListener("close", (event) => {
    onPanelDialogClose({
      event,
      suppressedPanelCloses: options.suppressedPanelCloses,
      urlStateReady: options.urlStateReady(),
      applyingUrlState: options.applyingUrlState(),
      syncUrlState: options.syncUrlState,
    });
    options.onAfterClose?.();
  });
}

export function bindPanelDialog(options: BindPanelDialogOptions) {
  const resolveDialogs = () => options.getDialogs?.() ?? options.dialogs;
  const resolveDialog = () =>
    options.getDialog?.() ??
    options.dialog ??
    getPanelDialog(options.panel, resolveDialogs() ?? {});

  ensurePanelDialogLifecycleBound({
    applyingUrlState: options.applyingUrlState,
    dialog: resolveDialog(),
    onAfterClose: options.onAfterClose,
    panel: options.panel,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });

  options.button?.addEventListener("click", async () => {
    options.onBeforeOpen?.();
    await options.ensureDialog?.();
    const dialogs = resolveDialogs();
    const dialog = resolveDialog();
    ensurePanelDialogLifecycleBound({
      applyingUrlState: options.applyingUrlState,
      dialog,
      onAfterClose: options.onAfterClose,
      panel: options.panel,
      suppressedPanelCloses: options.suppressedPanelCloses,
      syncUrlState: options.syncUrlState,
      urlStateReady: options.urlStateReady,
    });
    if (!dialogs) return;
    options.openPanel({
      panel: options.panel,
      dialogs,
      languageList: options.getLanguageList?.() ?? options.languageList,
      renderSavedEmoji: options.renderSavedEmoji,
      syncUrlState: options.syncUrlState,
    });
    await options.onAfterOpen?.();
  });
}
