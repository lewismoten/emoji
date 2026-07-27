type BrowserNavigator = Navigator & {
  standalone?: boolean;
  userAgentData?: { platform?: string };
};

type BeforeInstallPromptEventLike = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<unknown>;
};

export const installedDisplayQueries = [
  "standalone",
  "fullscreen",
  "minimal-ui",
  "window-controls-overlay",
].map((mode) => window.matchMedia(`(display-mode: ${mode})`));

export const isInstalledApp = () =>
  installedDisplayQueries.some((query) => query.matches) ||
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
  dialogs: PanelDialogs;
  languageList?: HTMLElement;
  renderSavedEmoji: () => void;
};

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
  if (dialogs.favorites?.open) return "favorites";
  if (dialogs.help?.open) return "help";
  if (dialogs.language?.open) return "language";
  if (dialogs.filters?.open) return "filters";
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
  syncUrlState: (
    mode?: "replace" | "push",
    historyState?: Record<string, unknown>,
  ) => void;
};

export function openPanelDialog({
  addHistory = true,
  panel,
  syncUrlState,
  ...context
}: OpenPanelOptions) {
  const dialog = getPanelDialog(panel, context.dialogs);
  if (!dialog) return;
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

type ClosePanelOptions = {
  applyingUrlState: boolean;
  event: Event;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: () => void;
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
  if (window.history.state?.panelDialogEntry) {
    window.history.back();
  } else {
    syncUrlState();
  }
}
