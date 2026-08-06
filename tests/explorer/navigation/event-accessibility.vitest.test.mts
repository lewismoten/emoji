import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  closestVerticalSavedEmoji,
  createThemeChoiceKeyDownHandler,
  syncSavedListFocus,
} from "../../../src/explorer/navigation/event-accessibility.js";
import * as state from "../../../src/state.js";
import {
  FakeButton,
  FakeCheckbox,
  FakeFieldset,
  FakeList,
  installEventAccessibilityDocument,
} from "./event-accessibility-fixture.js";

describe("event-accessibility", () => {
  it("handles focus movement, modifier groups, and saved dialog keyboard interactions", () => {
    const { restore } = installEventAccessibilityDocument();

    try {
      state.favoriteEmojiKeys.set(["sparkles"]);
      state.copiedEmojiKeys.set(["mailbox"]);

      syncSavedListFocus(null);
      const savedButtons = [
        new FakeButton("a"),
        new FakeButton("b"),
        new FakeButton("c"),
      ];
      const list = new FakeList(savedButtons);
      savedButtons[1].tabIndex = 0;
      syncSavedListFocus(list as any);
      assert.deepEqual(
        savedButtons.map((button) => button.tabIndex),
        [-1, 0, -1],
      );
      syncSavedListFocus(list as any, savedButtons[2] as any);
      assert.deepEqual(
        savedButtons.map((button) => button.tabIndex),
        [-1, -1, 0],
      );

      const verticalButtons = [
        new FakeButton("up"),
        new FakeButton("mid"),
        new FakeButton("down"),
      ];
      verticalButtons[0].rect = { left: 5, top: 0, width: 10, height: 10 };
      verticalButtons[1].rect = { left: 5, top: 20, width: 10, height: 10 };
      verticalButtons[2].rect = { left: 7, top: 40, width: 10, height: 10 };
      assert.equal(
        closestVerticalSavedEmoji(
          verticalButtons[1] as any,
          verticalButtons as any,
          1,
        ),
        verticalButtons[2],
      );
      assert.equal(
        closestVerticalSavedEmoji(
          verticalButtons[1] as any,
          verticalButtons as any,
          -1,
        ),
        verticalButtons[0],
      );

      const themeChoices = [
        new FakeButton("light"),
        new FakeButton("dark"),
        new FakeButton("retro"),
      ];
      const themeHandler = createThemeChoiceKeyDownHandler(themeChoices as any);
      const keyEvent = {
        currentTarget: themeChoices[1],
        key: "ArrowRight",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
      };
      themeHandler(keyEvent as any);
      assert.equal(keyEvent.preventDefaultCalled, true);
      assert.equal(themeChoices[2].focused, true);
      assert.equal(themeChoices[2].clicked, true);

      (globalThis.document as any).documentElement.dir = "rtl";
      const rtlEvent = {
        currentTarget: themeChoices[1],
        key: "ArrowRight",
        preventDefault() {},
      };
      themeHandler(rtlEvent as any);
      assert.equal(themeChoices[0].clicked, true);
      (globalThis.document as any).documentElement.dir = "ltr";
      const ignoredThemeEvent = {
        currentTarget: themeChoices[1],
        key: "Escape",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
      };
      themeHandler(ignoredThemeEvent as any);
      assert.equal(ignoredThemeEvent.preventDefaultCalled, false);

      const skin = new FakeCheckbox("1F3FB", "skin-tone");
      const hair = new FakeCheckbox("1F9B0", "hair");
      const gender = new FakeCheckbox("neutral", "gender");
      skin.checked = true;
      skin.label.rect = { left: 0, top: 0, width: 10, height: 10 };
      hair.label.rect = { left: 20, top: 0, width: 10, height: 10 };
      gender.label.rect = { left: 0, top: 20, width: 10, height: 10 };
      new FakeFieldset([skin, hair, gender]);
      const changes: string[] = [];
      bindModifierGroup([skin as any, hair as any, gender as any], (event) => {
        changes.push((event.currentTarget as unknown as FakeCheckbox).value);
      });
      assert.deepEqual([skin.tabIndex, hair.tabIndex, gender.tabIndex], [0, -1, -1]);
      hair.listeners.get("focus")?.({ target: hair });
      assert.deepEqual([skin.tabIndex, hair.tabIndex, gender.tabIndex], [-1, 0, -1]);
      hair.listeners.get("change")?.({ currentTarget: hair });
      assert.deepEqual(changes, ["1F9B0"]);
      const downEvent = {
        currentTarget: hair,
        key: "ArrowDown",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
      };
      hair.listeners.get("keydown")?.(downEvent);
      assert.equal(downEvent.preventDefaultCalled, true);
      assert.equal(gender.focused, true);
      hair.focused = false;
      skin.listeners.get("keydown")?.({
        currentTarget: skin,
        key: "ArrowRight",
        preventDefault() {},
      });
      assert.equal(hair.focused, true);
      const ignoredModifierEvent = {
        currentTarget: skin,
        key: "Escape",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
      };
      skin.listeners.get("keydown")?.(ignoredModifierEvent as any);
      assert.equal(ignoredModifierEvent.preventDefaultCalled, false);

      const favoriteButton = new FakeButton("fav");
      favoriteButton.dataset.savedEmoji = "sparkles";
      favoriteButton.dataset.savedSource = "favorites";
      const copiedButton = new FakeButton("copied");
      copiedButton.dataset.savedEmoji = "mailbox";
      copiedButton.dataset.savedSource = "copied";
      const copiedButtonTwo = new FakeButton("copied-two");
      copiedButtonTwo.dataset.savedEmoji = "postbox";
      copiedButtonTwo.dataset.savedSource = "copied";
      const favoritesList = new FakeList([favoriteButton]);
      const copiedList = new FakeList([copiedButton, copiedButtonTwo]);
      const allSavedButtons = [favoriteButton, copiedButton, copiedButtonTwo];
      const savedDialogListeners = new Map<string, (event: any) => void>();
      const savedDialog = {
        addEventListener(type: string, handler: (event: any) => void) {
          savedDialogListeners.set(type, handler);
        },
        querySelectorAll(selector: string) {
          return selector === "button[data-saved-emoji]" ? allSavedButtons : [];
        },
      };
      const closeCalls: string[] = [];
      const showCalls: Array<Record<string, unknown>> = [];
      const suppressed = new WeakSet<object>();
      bindSavedDialogInteractions({
        closePanel(dialog: object) {
          closeCalls.push(dialog === savedDialog ? "saved" : "other");
        },
        savedDialog,
        showEmoji(
          key: string,
          openDialog: boolean,
          navigationKeys: string[],
          mode: string,
          origin: string,
        ) {
          showCalls.push({ key, mode, navigationKeys, openDialog, origin });
        },
        suppressedPanelCloses: suppressed,
      });

      savedDialogListeners.get("click")?.({
        target: {
          closest(selector: string) {
            return selector === "[data-saved-emoji]" ? favoriteButton : null;
          },
        },
      });
      assert.deepEqual(closeCalls, ["saved"]);
      assert.deepEqual(showCalls[0], {
        key: "sparkles",
        mode: "details",
        navigationKeys: ["sparkles"],
        openDialog: true,
        origin: "favorites",
      });

      savedDialogListeners.get("focusin")?.({
        target: {
          closest(selector: string) {
            if (selector === "[data-saved-emoji]") return copiedButton;
            return null;
          },
        },
      });
      assert.equal(copiedButton.tabIndex, 0);

      const enterEvent = {
        key: "Enter",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: {
          closest(selector: string) {
            if (selector === "[data-saved-emoji]") return copiedButton;
            return null;
          },
        },
      };
      savedDialogListeners.get("keydown")?.(enterEvent);
      assert.equal(enterEvent.preventDefaultCalled, true);
      assert.equal(copiedButton.clicked, true);

      favoriteButton.parentList = favoritesList;
      copiedButton.parentList = copiedList;
      copiedButtonTwo.parentList = copiedList;
      favoriteButton.rect = { left: 0, top: 0, width: 10, height: 10 };
      copiedButton.rect = { left: 0, top: 20, width: 10, height: 10 };
      copiedButtonTwo.rect = { left: 20, top: 20, width: 10, height: 10 };
      const arrowEvent = {
        key: "ArrowDown",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: {
          closest(selector: string) {
            if (selector === "[data-saved-emoji]") return favoriteButton;
            return null;
          },
        },
      };
      savedDialogListeners.get("keydown")?.(arrowEvent);
      assert.equal(arrowEvent.preventDefaultCalled, true);
      assert.equal(copiedButton.focused, true);
      copiedButton.focused = false;
      const rightEvent = {
        key: "ArrowRight",
        preventDefault() {},
        target: {
          closest(selector: string) {
            if (selector === "[data-saved-emoji]") return copiedButton;
            return null;
          },
        },
      };
      savedDialogListeners.get("keydown")?.(rightEvent);
      assert.equal(copiedButtonTwo.focused, true);
      const ignoredSavedEvent = {
        key: "Escape",
        preventDefaultCalled: false,
        preventDefault() {
          this.preventDefaultCalled = true;
        },
        target: {
          closest(selector: string) {
            if (selector === "[data-saved-emoji]") return copiedButton;
            return null;
          },
        },
      };
      savedDialogListeners.get("keydown")?.(ignoredSavedEvent as any);
      assert.equal(ignoredSavedEvent.preventDefaultCalled, false);
    } finally {
      restore();
    }
  });
});
