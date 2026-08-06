import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createFilterControlSetup } from "../../../../src/explorer/filters/filter-controls.js";
import {
  FakeDocument,
  installFakeDocument,
} from "./filter-controls-fixture.mjs";

describe("filter-controls-setup", () => {
  it("creates and reuses filter control UI scaffolding", () => {
    const fakeDocument = new FakeDocument();
    const restore = installFakeDocument(fakeDocument);

    try {
      const filterOptions = fakeDocument.createElement("div");
      filterOptions.className = "filter-options";
      const filterGrid = fakeDocument.createElement("div");
      filterGrid.className = "filter-grid";
      fakeDocument.body.append(filterOptions, filterGrid);

      const groupField = fakeDocument.createElement("label");
      groupField.className = "filter-field";
      const groupLabel = fakeDocument.createElement("span");
      groupLabel.textContent = "Group";
      const groupSelector = fakeDocument.createElement("select");
      groupField.append(groupLabel, groupSelector);
      filterGrid.append(groupField);

      const versionField = fakeDocument.createElement("label");
      versionField.className = "filter-field version-field";
      const versionLabel = fakeDocument.createElement("span");
      versionLabel.textContent = "Version";
      const versionSelectElement = fakeDocument.createElement("select");
      const modeField = fakeDocument.createElement("div");
      modeField.className = "filter-field";
      const modeSelectElement = fakeDocument.createElement("select");
      versionField.append(versionLabel, versionSelectElement);
      modeField.append(modeSelectElement);
      filterGrid.append(versionField, modeField);

      const setup = createFilterControlSetup({
        document: fakeDocument as any,
        versionModeSelector: modeSelectElement as any,
        versionRange: () => setup.ensureVersionSlider().range,
        versionSelector: versionSelectElement as any,
      });

      const summaryParts = setup.ensureActiveFilterSummary();
      assert.equal(summaryParts.summary.className, "active-filter-summary");
      assert.equal(summaryParts.summary.hidden, true);
      assert.equal(summaryParts.text?.className, "active-filter-text");
      assert.equal(summaryParts.clear?.className, "clear-filters");
      summaryParts.summary.setAttribute("role", "status");
      summaryParts.summary.setAttribute("aria-live", "polite");
      const reusedSummary = setup.ensureActiveFilterSummary();
      assert.equal(reusedSummary.summary, summaryParts.summary);
      assert.equal(reusedSummary.summary.getAttribute("role"), null);
      assert.equal(reusedSummary.summary.getAttribute("aria-live"), null);

      const choices = setup.ensureChoiceContainer(
        groupSelector as any,
        "compact-group-choices",
        "group-filter-label",
      );
      assert.equal(choices.className, "compact-choices compact-group-choices");
      assert.equal(choices.role, "radiogroup");
      assert.equal(
        groupSelector.dataset["attr:aria-labelledby"],
        "group-filter-label",
      );
      assert.equal(groupField.tagName, "LABEL");
      assert.equal(filterGrid.children[0]?.tagName, "DIV");
      assert.equal(
        setup.ensureChoiceContainer(
          groupSelector as any,
          "compact-group-choices",
          "group-filter-label",
        ),
        choices,
      );

      const selectionLabel = setup.ensureSelectionLabel(
        groupSelector as any,
        "compact-group-label",
        "group-filter-label",
      );
      assert.equal(selectionLabel?.className, "compact-group-label");
      assert.equal(
        filterGrid.children[0]?.querySelector(".filter-heading")?.className,
        "filter-heading",
      );
      assert.equal(
        setup.ensureSelectionLabel(
          groupSelector as any,
          "compact-group-label",
          "group-filter-label",
        ),
        selectionLabel,
      );

      const sequenceFilter = setup.ensureSequenceTypeFilter();
      assert.equal(sequenceFilter?.className, "select-sequence-type");
      assert.equal(
        filterGrid.children[1]?.className,
        "filter-field sequence-filter-field has-choice-buttons",
      );

      const slider = setup.ensureVersionSlider();
      assert.equal(slider.range.className, "version-range");
      assert.equal(slider.range.type, "range");
      assert.equal(slider.output.className, "version-range-value");

      const versionModeButton = setup.ensureVersionModeToggle();
      assert.equal(versionModeButton.className, "version-mode-toggle");
      assert.equal(modeField.hidden, true);
      assert.equal(modeSelectElement.hidden, true);
      assert.equal(setup.ensureVersionModeToggle(), versionModeButton);

      const orphanDocument = new FakeDocument();
      const orphanSelector = orphanDocument.createElement("select");
      const orphanSetup = createFilterControlSetup({
        document: orphanDocument as any,
        versionModeSelector: orphanSelector as any,
        versionRange: () => undefined,
        versionSelector: orphanSelector as any,
      });
      const orphanSummary = orphanSetup.ensureActiveFilterSummary();
      assert.equal(orphanSummary.summary.className, "active-filter-summary");
      assert.equal(
        orphanDocument.getElementsByClassName("active-filter-summary").length,
        0,
      );
      const orphanChoices = orphanSetup.ensureChoiceContainer(
        orphanSelector as any,
        "compact-orphan-choices",
        "orphan-filter-label",
      );
      assert.equal(
        orphanChoices.className,
        "compact-choices compact-orphan-choices",
      );
      assert.equal(
        orphanSetup.ensureSelectionLabel(
          orphanSelector as any,
          "compact-orphan-label",
          "orphan-filter-label",
        ),
        undefined,
      );
      assert.equal(
        orphanSetup.ensureVersionSlider().range.className,
        "version-range",
      );
      assert.equal(
        orphanSetup.ensureVersionModeToggle().className,
        "version-mode-toggle",
      );
    } finally {
      restore();
    }
  });
});
