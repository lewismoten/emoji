export type ExplorerMode = "standard" | "advanced" | "developer";

export type ExplorerState = {
  developerModeUrlDismissed: boolean;
  developerModeFromUrl: boolean;
  explorerModeFromUrl?: ExplorerMode;
};

export type DeveloperModeControllerOptions = {
  choices?: () => [];
  state: () => ExplorerState;
  renderThemeToggle: () => void;
  loadVersionData: () => void;
  dialog: () => HTMLDialogElement | void;
  setDialogView: (name: string) => void;
  disableDeveloperFeatures: () => void;
  syncUrlState: () => void;
  toggle?: () => Element & { checked: boolean };
};
