import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, it } from "vitest";

import {
  root,
  demoHtml,
  demoStyles,
  dialogRenderHelper,
  dialogUpgradeHelper,
  emojiDialogEvents,
  emojiFormatHelper,
  emojiCompositionSectionControlSource,
  emojiListInteractionHelper,
  emojiListSources,
  listController,
  loadingState,
  pwaPanelsHelper,
  savedEmojiHelper,
  utilityControlsHelper,
  versionModeController,
} from "../shared/unit-fixtures.mjs";

const readCssWithImports = async (
  file: string,
  seen = new Set<string>(),
): Promise<string> => {
  const absolute = path.resolve(root, file);
  if (seen.has(absolute)) {
    throw new Error(`Circular CSS import detected in tests: ${absolute}`);
  }
  seen.add(absolute);
  const source = await fs.readFile(absolute, "utf8");
  const directory = path.dirname(absolute);
  let result = "";
  let cursor = 0;
  for (const match of source.matchAll(/@import\s+["'](.+?)["'];/g)) {
    const [statement, importPath] = match;
    const index = match.index ?? 0;
    result += source.slice(cursor, index);
    result += await readCssWithImports(
      path.relative(root, path.resolve(directory, importPath)),
      seen,
    );
    cursor = index + statement.length;
  }
  result += source.slice(cursor);
  seen.delete(absolute);
  return result;
};

describe("explorer-interactions integration", () => {
  it("preserves interaction and loading contracts", async () => {
    assert.match(
      emojiCompositionSectionControlSource,
      /className:\s*"emoji-composition developer-only"/,
      "emoji details must provide a sequence composition section",
    );
    assert.match(
      demoHtml,
      /class="pixel-comparison"[\s\S]*role="radiogroup"[\s\S]*class="emoji-font-choice emoji-font-choice-system"[\s\S]*role="radio"[\s\S]*class="emoji-font-choice emoji-font-choice-pixel"[\s\S]*role="radio"/,
      "demo must provide system and pixel font choices in the comparison",
    );
    assert.match(
      demoHtml,
      /class="filter-field has-choice-buttons"[\s\S]*class="select-group"[\s\S]*class="filter-field has-choice-buttons"[\s\S]*class="select-subgroup"/,
      "initial group controls must reserve their enhanced-picker layout before JavaScript loads",
    );
    assert.match(
      demoHtml,
      /class="filter-field version-field developer-only has-version-slider"/,
      "the initial version control must reserve its enhanced-slider layout before JavaScript loads",
    );
    assert.match(
      demoHtml,
      /initialDeveloperMode &&[\s\S]*initialUrlParams\.get\("order"\) === "sequence"[\s\S]*dataset\.initialOrder = "sequence"/,
      "sequence-order URLs must be identified before the first paint",
    );
    assert.match(
      demoStyles,
      /\.app-loading\[data-initial-order="sequence"\][\s\S]*\.basic-filter-grid[\s\S]*> \.filter-field[\s\S]*display: none/,
      "sequence-order URLs must not reserve the grouped-filter row while loading",
    );
    assert.match(
      demoStyles,
      /\.version-mode-toggle:hover,[\s\S]*background: var\(--ega-white\)|\.version-mode-toggle:hover\s*\{[^}]*background:/,
      "the version target must visually distinguish hover, selection, and keyboard focus",
    );
    assert.match(
      demoStyles,
      /\.version-mode-toggle\[aria-pressed="true"\]\s*\{[^}]*background: var\(--selected-control-bg\)[^}]*color: var\(--selected-control-text\)|html\[data-theme="retro"\] \.version-mode-toggle\[aria-pressed="true"\]\s*\{[^}]*background: var\(--ega-black\)[^}]*color: var\(--ega-light-gray\)/,
      "the selected version target must use a filled state",
    );
    assert.match(
      await fs.readFile(
        path.join(root, "src/controls/filters/version/version-mode-toggle.ts"),
        "utf8",
      ),
      /\.version-mode-toggle:focus-visible\s*\{[^}]*outline:\s*2px dashed var\(--accent-strong\)[^}]*outline-offset:\s*var\(--focus-outline-offset\)/,
      "the version target must reserve its outline for keyboard focus",
    );
    assert.match(
      `${versionModeController}`,
      /function toggleVersionMode\(event(?:: any)?\)[\s\S]*event\?\.detail > 0[\s\S]*event\.currentTarget\.blur\(\)/,
      "pointer toggles must not retain a misleading focus treatment",
    );
    assert.match(
      await fs.readFile(
        path.join(root, "src/controls/filters/pickers/compact-choice-button.ts"),
        "utf8",
      ),
      /\.compact-choice\[aria-checked="true"\]\s*\{[^}]*background:\s*var\(--selected-control-bg\)[^}]*color:\s*var\(--selected-control-text\)/,
      "selected group and subgroup choices must use a filled state distinct from focus",
    );
    assert.match(
      await fs.readFile(
        path.join(root, "src/controls/filters/pickers/compact-choice-button.ts"),
        "utf8",
      ),
      /\.compact-choice:focus-visible\s*\{[^}]*outline:\s*2px dashed var\(--accent-strong\)/,
      "group and subgroup choices must reserve their outline for keyboard focus",
    );
    assert.match(
      await readCssWithImports("src/site/index.css"),
      /\.modifier-filter-option:has\(input:checked\)\s*\{[\s\S]*background:\s*var\(--selected-control-bg\)[\s\S]*color:\s*var\(--selected-control-text\)[\s\S]*\}[\s\S]*\.modifier-filter-option:has\(input:focus-visible\)\s*\{[\s\S]*outline:\s*2px dashed/,
      "selected modifier buttons must use a filled state distinct from focus",
    );
    assert.match(
      demoStyles,
      /--motion-fast: 180ms[\s\S]*--motion-medium: 240ms[\s\S]*dialog\[open\]\s*\{[\s\S]*animation: dialog-enter[\s\S]*@keyframes dialog-enter[\s\S]*transform: translateY\(0\.65rem\) scale\(0\.96\)/,
      "dialogs must use a short compositor-friendly entrance animation",
    );
    assert.match(
      demoStyles,
      /\.compact-choice,[\s\S]*\.modifier-filter-option,[\s\S]*\.order-mode,[\s\S]*transition:[\s\S]*background-color var\(--motion-fast\)[\s\S]*transform var\(--motion-fast\)/,
      "interactive controls must share short visual-state transitions",
    );
    assert.match(
      demoStyles,
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*--motion-fast: 0ms[\s\S]*--motion-medium: 0ms[\s\S]*dialog\[open\],[\s\S]*dialog\[open\]::backdrop[\s\S]*animation: none/,
      "motion must be disabled when reduced motion is requested",
    );
    assert.match(
      demoStyles,
      /\.compact-choice\[aria-checked="true"\],[\s\S]*\.version-mode-toggle\[aria-pressed="true"\],[\s\S]*\.order-mode\.is-active[\s\S]*animation: control-selected[\s\S]*@keyframes control-selected[\s\S]*transform: scale\(0\.9\)[\s\S]*transform: scale\(1\.04\)/,
      "newly selected controls must provide visible state-change feedback",
    );
    assert.match(
      emojiDialogEvents,
      /if\s*\(button\.matches\((["'])\.emoji-preview\1\)\)\s*options\.animateCopy\(button\)/,
      "successful emoji copies must animate the preview button",
    );
    assert.match(
      await fs.readFile(
        path.join(root, "src/explorer/utility/copy-feedback.ts"),
        "utf8",
      ),
      /prefers-reduced-motion: reduce[\s\S]*emoji-copy-confirmation[\s\S]*transform:\s*(["'])scale\(0\.9\)\1[\s\S]*transform:\s*(["'])scale\(1\.05\)\2/,
      "successful emoji copies must provide motion-aware visual confirmation",
    );
    assert.match(
      savedEmojiHelper,
      /available\.map\(\(key, index\)[\s\S]*--saved-index[\s\S]*Math\.min\(index, 12\)/,
      "saved emoji must receive a capped stagger position",
    );
    assert.match(
      await fs.readFile(
        path.join(root, "src/controls/dialog/content/saved-dialog.ts"),
        "utf8",
      ),
      /\.saved-emoji-list button \{[\s\S]*animation: saved-emoji-enter 320ms[\s\S]*animation-delay: calc\(var\(--saved-index, 0\) \* 24ms\)[\s\S]*@media \(hover: hover\)[\s\S]*translateY\(-0\.2rem\) rotate\(-2deg\) scale\(1\.08\)[\s\S]*@keyframes saved-emoji-enter[\s\S]*scale\(0\.72\)[\s\S]*scale\(1\.08\)/,
      "saved emoji must enter in a friendly stagger and lift on hover",
    );
    assert.match(
      demoHtml,
      /class="show-pixel-editor developer-only"/,
      "emoji details must provide a pixel-editor mode",
    );
    assert.match(
      utilityControlsHelper,
      /function ensureUtilityControls/,
      "new utility controls must be restored when cached HTML is stale",
    );
    assert.match(
      dialogUpgradeHelper,
      /function upgradeEmojiDialog[\s\S]*ensureRenderingDiagnostic\(options\.exampleDialog\)[\s\S]*function ensureRenderingDiagnostic[\s\S]*system-render-glyph[\s\S]*pixel-render-glyph[\s\S]*rendering-result/,
      "cached emoji dialogs must be upgraded with complete rendering diagnostics",
    );
    assert.match(
      dialogRenderHelper,
      /function updateRenderingDiagnostic[\s\S]*if \(!section \|\| !invitation\) return[\s\S]*if \(!systemGlyph \|\| !pixelGlyph \|\| !result\) return/,
      "rendering diagnostics must tolerate stale cached dialog markup",
    );
    assert.match(
      loadingState,
      /function finishExplorerLoading[\s\S]*function revealExplorer/,
      "loading controls must delegate through extracted helpers",
    );
    assert.match(
      pwaPanelsHelper,
      /panelDialogEntry/,
      "utility dialogs must participate in browser history",
    );
    assert.match(
      emojiFormatHelper,
      /replace\(\/\[\\p\{P\}\\p\{S\}\]\+\/gu,\s*(["'])\s\1\)/,
      "English-name comparisons must ignore punctuation and symbols",
    );
    assert.match(
      `${emojiListSources}\n${emojiListInteractionHelper}\n${listController}`,
      /scheduleSearchDraw|finishEmojiListRender/,
      "list rendering helpers must stay wired into interaction flow",
    );
  });
});
