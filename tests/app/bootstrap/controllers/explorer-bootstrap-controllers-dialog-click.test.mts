import assert from "node:assert/strict";
import {
  createBootstrapControllersFixture,
  installBootstrapControllerDom,
} from "./explorer-bootstrap-controllers-fixture.js";

const { restore } = installBootstrapControllerDom();

try {
  const { createControllers, options, state } =
    createBootstrapControllersFixture();

  (globalThis as any).window = {
    history: {
      state: {
        dialogParentPanel: "favorites",
        compositionParent: "wrappedGift",
      },
    },
    location: { href: "https://example.test/" },
  };

  let dialogClosed = false;
  let suppressSync = false;
  let openedPanel: any = undefined;
  let syncedState: any = undefined;
  state.currentDialogParentStack = ["favorites"];
  const dialogElement = {
    dataset: { dialogParentPanel: "favorites" },
    close() {
      dialogClosed = true;
    },
    showModal() {},
    querySelector() {
      return null;
    },
  };

  const clickControllers = createControllers({
    dialog: () => dialogElement,
    languageList: () => "language-list",
    openPanel: (value: unknown) => {
      openedPanel = value;
    },
    panelDialogs: () => ({ favorites: "favorites-dialog" }),
    setSuppressDialogCloseSync: (value: boolean) => {
      suppressSync = value;
    },
    syncUrlState: (...args: unknown[]) => {
      syncedState = args;
    },
  });

  clickControllers.onEmojiDialogClick({
    target: {
      closest(selector: string) {
        return selector === ".emoji-parent" ? {} : null;
      },
    },
  } as unknown as MouseEvent);

  assert.equal(dialogClosed, true);
  assert.equal(suppressSync, false);
  assert.deepEqual(state.currentDialogParentStack, []);
  assert.equal(openedPanel.panel, "favorites");
  assert.equal(openedPanel.addHistory, false);
  assert.deepEqual(openedPanel.dialogs, { favorites: "favorites-dialog" });
  assert.equal(openedPanel.languageList, "language-list");
  assert.equal(openedPanel.renderSavedEmoji, options.renderSavedEmoji);
  assert.equal(typeof openedPanel.syncUrlState, "function");
  assert.deepEqual(syncedState, ["replace", {}]);
} finally {
  restore();
}
