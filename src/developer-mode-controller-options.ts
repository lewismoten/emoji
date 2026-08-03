export type ExplorerMode = "standard" | "advanced" | "developer";

export type ExplorerState = {
  developerModeUrlDismissed: boolean;
  developerModeFromUrl: boolean;
  explorerModeFromUrl?: "" | ExplorerMode;
};

export type DeveloperModeControllerOptions = {
  choices?: () => any[] | undefined;
  state: () => ExplorerState;
  renderThemeToggle?: () => void;
  loadVersionData: () => void | Promise<void>;
  dialog: () =>
    | { open?: boolean; classList?: { contains?: (name: string) => boolean } }
    | HTMLDialogElement
    | void;
  setDialogView: (name: string) => void;
  disableDeveloperFeatures: () => void;
  savePreference?: (key: string, value: unknown) => void;
  syncUrlState: () => void;
  toggle?: () => ({ checked?: boolean } & Record<string, any>) | null;
};
