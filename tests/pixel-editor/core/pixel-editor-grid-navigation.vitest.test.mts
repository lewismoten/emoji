import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  bindPaletteGrid,
  bindRovingGrid,
  syncRovingGrid,
} from "../../../src/pixel-editor/core/pixel-editor-grid-navigation.js";
import {
  FakeButton,
  installGridNavigationDom,
  keyEvent,
  resetFocus,
} from "./pixel-editor-grid-navigation-fixture.js";

describe("pixel-editor-grid-navigation", () => {
  it("supports roving and palette grid keyboard navigation", () => {
    const { browserGlobal, restore } = installGridNavigationDom();
    try {
      const invisible = new FakeButton({ visible: false });
      const active = new FakeButton({ ariaPressed: "true" });
      const selected = new FakeButton({ selectedClass: "is-selected" });
      const tabStop = new FakeButton({ tabIndex: 0 });
      const plain = new FakeButton();
      const activeClassButton = new FakeButton({ activeClass: "is-active" });

      syncRovingGrid(
        [invisible, active, selected, tabStop, plain] as any,
        undefined,
      );
      assert.equal(active.tabIndex, 0);
      assert.equal(selected.tabIndex, -1);

      const explicitActive = new FakeButton();
      syncRovingGrid([explicitActive, plain] as any, explicitActive as any);
      assert.equal(explicitActive.tabIndex, 0);

      const emptyVisible = new FakeButton({ visible: false });
      syncRovingGrid([emptyVisible] as any, undefined);
      assert.equal(emptyVisible.tabIndex, -1);

      syncRovingGrid([invisible, activeClassButton, plain] as any, undefined);
      assert.equal(activeClassButton.tabIndex, 0);

      const firstFallback = new FakeButton();
      const secondFallback = new FakeButton();
      syncRovingGrid([firstFallback, secondFallback] as any, undefined);
      assert.equal(firstFallback.tabIndex, 0);
      assert.equal(secondFallback.tabIndex, -1);

      const rowButtons = [
        new FakeButton({ left: 0, top: 0 }),
        new FakeButton({ left: 40, top: 0 }),
        new FakeButton({ left: 80, top: 0 }),
        new FakeButton({ left: 0, top: 40 }),
        new FakeButton({ left: 40, top: 40 }),
      ];
      bindRovingGrid(rowButtons as any);
      rowButtons[0].focus();

      let event = keyEvent("ArrowRight");
      rowButtons[0].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(rowButtons[1].focused, true);

      event = keyEvent("ArrowDown");
      rowButtons[1].dispatch("keydown", event);
      assert.equal(rowButtons[4].focused, true);

      event = keyEvent("ArrowUp");
      rowButtons[4].dispatch("keydown", event);
      assert.equal(rowButtons[1].focused, true);

      event = keyEvent("Home");
      rowButtons[4].dispatch("keydown", event);
      assert.equal(rowButtons[0].focused, true);

      event = keyEvent("End");
      rowButtons[0].dispatch("keydown", event);
      assert.equal(rowButtons[4].focused, true);

      event = keyEvent("Escape");
      rowButtons[4].dispatch("keydown", event);
      assert.equal(event.prevented, false);

      rowButtons[2].click();
      assert.equal(rowButtons[2].tabIndex, 0);

      browserGlobal.document.documentElement.dir = "rtl";
      const rtlButtons = [
        new FakeButton({ left: 0, top: 0 }),
        new FakeButton({ left: 40, top: 0 }),
      ];
      bindRovingGrid(rtlButtons as any);
      rtlButtons[0].focus();
      event = keyEvent("ArrowLeft");
      rtlButtons[0].dispatch("keydown", event);
      assert.equal(rtlButtons[1].focused, true);
      event = keyEvent("ArrowRight");
      rtlButtons[1].dispatch("keydown", event);
      assert.equal(rtlButtons[0].focused, true);
      browserGlobal.document.documentElement.dir = "ltr";

      const singleButton = [new FakeButton({ left: 0, top: 0 })];
      bindRovingGrid(singleButton as any);
      event = keyEvent("ArrowUp");
      singleButton[0].dispatch("keydown", event);
      assert.equal(event.prevented, false);

      const paletteButtons = [
        new FakeButton(),
        new FakeButton(),
        new FakeButton(),
        new FakeButton(),
      ];
      paletteButtons[0].dataset.gridRow = "1";
      paletteButtons[0].dataset.gridColumn = "1";
      paletteButtons[1].dataset.gridRow = "1";
      paletteButtons[1].dataset.gridColumn = "2";
      paletteButtons[2].dataset.gridRow = "2";
      paletteButtons[2].dataset.gridColumn = "1";
      paletteButtons[3].dataset.gridRow = "2";
      paletteButtons[3].dataset.gridColumn = "2";

      bindPaletteGrid(paletteButtons as any);
      paletteButtons[0].focus();

      resetFocus(paletteButtons);
      event = keyEvent("ArrowDown");
      paletteButtons[0].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(paletteButtons[2].focused, true);

      resetFocus(paletteButtons);
      event = keyEvent("ArrowUp");
      paletteButtons[2].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(paletteButtons[0].focused, true);

      resetFocus(paletteButtons);
      event = keyEvent("ArrowRight");
      paletteButtons[2].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(paletteButtons[3].focused, true);

      event = keyEvent("Home");
      paletteButtons[3].dispatch("keydown", event);
      assert.equal(paletteButtons[0].focused, true);

      event = keyEvent("End");
      paletteButtons[0].dispatch("keydown", event);
      assert.equal(paletteButtons[3].focused, true);

      paletteButtons[1].click();
      assert.equal(paletteButtons[1].tabIndex, 0);

      browserGlobal.document.documentElement.dir = "rtl";
      resetFocus(paletteButtons);
      event = keyEvent("ArrowLeft");
      paletteButtons[2].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(paletteButtons[3].focused, true);
      resetFocus(paletteButtons);
      event = keyEvent("ArrowRight");
      paletteButtons[3].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(paletteButtons[2].focused, true);
      browserGlobal.document.documentElement.dir = "ltr";

      const styleGridButtons = [
        new FakeButton(),
        new FakeButton(),
        new FakeButton(),
      ];
      styleGridButtons[1].dataset.gridRow = "2";
      styleGridButtons[1].dataset.gridColumn = "1";
      styleGridButtons[2].dataset.gridRow = "2";
      styleGridButtons[2].dataset.gridColumn = "2";
      bindPaletteGrid(styleGridButtons as any);
      styleGridButtons[0].focus();

      event = keyEvent("ArrowDown");
      styleGridButtons[0].dispatch("keydown", event);
      assert.equal(styleGridButtons[1].focused, true);

      const fallbackStyleButtons = [new FakeButton(), new FakeButton()];
      fallbackStyleButtons[1].dataset.gridRow = "2";
      fallbackStyleButtons[1].dataset.gridColumn = "1";
      browserGlobal.getComputedStyle = (button: FakeButton) => ({
        gridRowStart:
          button === fallbackStyleButtons[0]
            ? "auto"
            : (button.dataset.gridRow ?? "1"),
        gridColumnStart:
          button === fallbackStyleButtons[0]
            ? "auto"
            : (button.dataset.gridColumn ?? "1"),
      });
      bindPaletteGrid(fallbackStyleButtons as any);
      fallbackStyleButtons[1].focus();
      resetFocus(fallbackStyleButtons);
      event = keyEvent("ArrowUp");
      fallbackStyleButtons[1].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(fallbackStyleButtons[0].focused, true);
      browserGlobal.getComputedStyle = (button: FakeButton) => ({
        gridRowStart: button.dataset.gridRow ?? "1",
        gridColumnStart: button.dataset.gridColumn ?? "1",
      });

      const horizontalPaletteButtons = [new FakeButton(), new FakeButton()];
      horizontalPaletteButtons[0].dataset.gridRow = "1";
      horizontalPaletteButtons[0].dataset.gridColumn = "1";
      horizontalPaletteButtons[1].dataset.gridRow = "1";
      horizontalPaletteButtons[1].dataset.gridColumn = "2";
      bindPaletteGrid(horizontalPaletteButtons as any);
      horizontalPaletteButtons[1].focus();
      resetFocus(horizontalPaletteButtons);
      event = keyEvent("ArrowLeft");
      horizontalPaletteButtons[1].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(horizontalPaletteButtons[0].focused, true);

      const hiddenPaletteButton = new FakeButton({ hidden: true });
      hiddenPaletteButton.dataset.gridRow = "1";
      hiddenPaletteButton.dataset.gridColumn = "1";
      const visiblePaletteButton = new FakeButton();
      visiblePaletteButton.dataset.gridRow = "1";
      visiblePaletteButton.dataset.gridColumn = "2";
      bindPaletteGrid([hiddenPaletteButton, visiblePaletteButton] as any);
      event = keyEvent("ArrowRight");
      hiddenPaletteButton.dispatch("keydown", event);
      assert.equal(event.prevented, false);

      const edgePaletteButtons = [new FakeButton(), new FakeButton()];
      edgePaletteButtons[0].dataset.gridRow = "1";
      edgePaletteButtons[0].dataset.gridColumn = "1";
      edgePaletteButtons[1].dataset.gridRow = "2";
      edgePaletteButtons[1].dataset.gridColumn = "2";
      bindPaletteGrid(edgePaletteButtons as any);
      edgePaletteButtons[0].focus();
      event = keyEvent("ArrowLeft");
      edgePaletteButtons[0].dispatch("keydown", event);
      assert.equal(event.prevented, true);
      assert.equal(edgePaletteButtons[0].focused, true);

      event = keyEvent("PageDown");
      edgePaletteButtons[0].dispatch("keydown", event);
      assert.equal(event.prevented, false);
    } finally {
      restore();
    }
  });
});
