import type { ExplorerUrlState } from "./url-state.js";

export type Checkbox = { checked: boolean; value: string };

export type ExplorerPanel = "" | "favorites" | "help" | "language" | "filters";

export type ExplorerNavigationOptions = {
  allowedSequenceTypes: string[];
  applyingUrlState: () => boolean;
  closeEmojiDialog: () => void;
  compositionMode: () => "condensed" | "full";
  developerModeEnabled: () => boolean;
  fullDeveloperModeEnabled: () => boolean;
  dialog: () => HTMLDialogElement;
  currentEmojiKey: () => string;
  drawList: () => void;
  ensurePanelDialog?: (panel: ExplorerPanel) => Promise<void> | void;
  genderCheckboxes: () => Checkbox[];
  getOrderMode: () => "grouped" | "popular" | "unicode" | "sequence";
  groups: () => string[];
  getSelectedGroup: () => string;
  getSelectedSequenceType: () => string;
  getSelectedSubGroup: () => string;
  hairCheckboxes: () => Checkbox[];
  helpDialog: () => HTMLDialogElement | undefined;
  latestReleasedVersion: () => string | undefined;
  navigateEmoji: (amount: number) => void;
  openEmoji: (
    key: string,
    openDialog?: boolean,
    navigationKeys?: string[],
    initialMode?: ExplorerUrlState["emojiMode"],
  ) => void;
  orderButtons: () => any[];
  panelDialogs: () => any;
  languageList: () => HTMLElement | undefined;
  preferredOrder: () => string;
  renderCategoryFilters: () => void;
  renderSavedEmoji: () => void;
  renderVersionModeToggle: () => void;
  searchText: () => HTMLInputElement;
  setCompositionMode: (mode: "condensed" | "full") => void;
  setDialogView: (
    mode: ExplorerUrlState["emojiMode"],
    updateUrl: boolean,
  ) => void;
  setOrderMode: (mode: "grouped" | "popular" | "unicode" | "sequence") => void;
  setSelectedGroup: (value: string) => void;
  setSelectedSequenceType: (value: string) => void;
  setSelectedSubGroup: (value: string) => void;
  showEmojiDialog: () => void;
  skinToneCheckboxes: () => Checkbox[];
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  suppressedPanelCloses: () => WeakSet<HTMLDialogElement>;
  syncVersionRange: () => void;
  urlStateReady: () => boolean;
  versionModeSelector: () => HTMLSelectElement;
  versionRange: () => HTMLInputElement;
  versionSelector: () => HTMLSelectElement;
};
