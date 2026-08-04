
export type PanelName = "" | "favorites" | "help" | "language" | "filters";

export type BrowserNavigator = Navigator & {
  standalone?: boolean;
  userAgentData?: { platform?: string };
};

type BeforeInstallPromptEventLike = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<unknown>;
};

export type InstallAppOptions = {
  deferredInstallPrompt: BeforeInstallPromptEventLike | undefined;
  event?: Event & { currentTarget?: EventTarget | null; detail?: number };
  installDialog?: HTMLDialogElement;
  renderInstallAppButton: () => void;
};

export type InstallAppResult = {
  deferredInstallPrompt: BeforeInstallPromptEventLike | undefined;
};

export type PanelDialogs = Record<
    Exclude<PanelName, "">,
    HTMLDialogElement | undefined
  >;
export type PanelContext = {
  dialogs?: PanelDialogs;
  languageList?: HTMLElement;
  renderSavedEmoji: () => void;
};

type SyncUrlState = (
  mode?: "replace" | "push",
  historyState?: Record<string, unknown>,
) => void;

export type OpenPanelOptions = PanelContext & {
  addHistory?: boolean;
  panel: Exclude<PanelName, "">;
  syncUrlState: SyncUrlState;
};

export type ClosePanelOptions = {
  applyingUrlState: boolean;
  event: Event;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: SyncUrlState;
  urlStateReady: boolean;
};

export type BindPanelDialogOptions = PanelContext & {
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

export type EnsurePanelDialogLifecycleBoundOptions = {
  applyingUrlState: () => boolean;
  dialog?: HTMLDialogElement;
  onAfterClose?: () => void;
  panel: Exclude<PanelName, "">;
  suppressedPanelCloses: WeakSet<HTMLDialogElement>;
  syncUrlState: SyncUrlState;
  urlStateReady: () => boolean;
};
