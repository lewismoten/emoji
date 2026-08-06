import assert from "node:assert/strict";

import { FakeDialog, FakeElement } from "./pwa-panels-fixture.mjs";

export function assertPanelResolutionAndFocus(options: {
  focusPanelDialog: (...args: any[]) => void;
  getOpenPanel: (...args: any[]) => string;
  getPanelDialog: (...args: any[]) => HTMLDialogElement | undefined;
}) {
  const { focusPanelDialog, getOpenPanel, getPanelDialog } = options;
  const dialogs = {
    filters: new FakeDialog(),
    favorites: new FakeDialog(),
    help: new FakeDialog(),
    language: new FakeDialog(),
  };
  const suppressedPanelCloses = new WeakSet<any>();

  assert.equal(getPanelDialog("help", dialogs as any), dialogs.help);
  assert.equal(getPanelDialog("filters", dialogs as any), dialogs.filters);
  assert.equal(getPanelDialog("favorites", dialogs as any), dialogs.favorites);
  assert.equal(getPanelDialog("language", dialogs as any), dialogs.language);
  assert.equal(getPanelDialog("", dialogs as any), undefined);
  assert.equal(getOpenPanel({} as any), "");
  dialogs.filters.open = true;
  assert.equal(getOpenPanel(dialogs as any), "filters");
  dialogs.filters.open = false;
  dialogs.language.open = true;
  assert.equal(getOpenPanel(dialogs as any), "language");
  dialogs.language.open = false;
  dialogs.help.open = true;
  assert.equal(getOpenPanel(dialogs as any), "help");
  dialogs.help.open = false;
  dialogs.favorites.open = true;
  assert.equal(getOpenPanel(dialogs as any), "favorites");
  dialogs.favorites.open = false;
  dialogs.favorites.open = true;
  dialogs.favorites.dataset.panelClosing = "true";
  assert.equal(getOpenPanel(dialogs as any), "");
  delete dialogs.favorites.dataset.panelClosing;
  dialogs.favorites.open = false;

  const savedButton = new FakeElement();
  dialogs.favorites.queryMap.set(".saved-emoji-list button", savedButton);
  dialogs.favorites.queryMap.set(".dialog-close", new FakeElement());
  let renderSavedEmojiCalls = 0;
  focusPanelDialog("favorites", dialogs.favorites as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {
      renderSavedEmojiCalls += 1;
    },
  });
  assert.equal(renderSavedEmojiCalls, 1);
  assert.equal(savedButton.focused, true);

  const selectedLanguage = new FakeElement();
  const languageList = new FakeElement();
  languageList.queryMap.set(".is-selected", selectedLanguage);
  dialogs.language.queryMap.set(".dialog-close", new FakeElement());
  focusPanelDialog("language", dialogs.language as any, {
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
  });
  assert.equal(selectedLanguage.focused, true);
  const languageFallbackClose = new FakeElement();
  dialogs.language.queryMap.set(".dialog-close", languageFallbackClose);
  languageList.queryMap.delete(".is-selected");
  focusPanelDialog("language", dialogs.language as any, {
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
  });
  assert.equal(languageFallbackClose.focused, true);

  const filterTarget = new FakeElement();
  dialogs.filters.queryMap.set(
    ".version-mode-toggle, .compact-choice, .modifier-filters label, .dialog-close",
    filterTarget,
  );
  focusPanelDialog("filters", dialogs.filters as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(filterTarget.focused, true);
  const filterFallbackClose = new FakeElement();
  dialogs.filters.queryMap.delete(
    ".version-mode-toggle, .compact-choice, .modifier-filters label, .dialog-close",
  );
  dialogs.filters.queryMap.set(".dialog-close", filterFallbackClose);
  focusPanelDialog("filters", dialogs.filters as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(filterFallbackClose.focused, true);

  dialogs.help.queryMap.set(".dialog-close", new FakeElement());
  focusPanelDialog("help", dialogs.help as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(
    (dialogs.help.queryMap.get(".dialog-close") as FakeElement).focused,
    true,
  );

  const emptyLanguageDialog = new FakeDialog();
  assert.doesNotThrow(() =>
    focusPanelDialog("language", emptyLanguageDialog as any, {
      dialogs: dialogs as any,
      renderSavedEmoji() {},
    }),
  );
  assert.equal(
    getPanelDialog("filters", { filters: undefined } as any),
    undefined,
  );

  return { dialogs, languageList, suppressedPanelCloses };
}
