import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  arabicDemo,
  catalogLoader,
  demoHtml,
  demoScript,
  demoStyles,
  developerModeControllerChangeSource,
  explorerBootstrapSessionSource,
  explorerBootstrapShellSource,
  explorerPreferencesSource,
  explorerUi,
  filterPickerHelper,
  helpSettingsDialogControlSource,
  pixelArtwork,
  pixelEditorLoaderSource,
  pwaPanelsHelper,
  searchLanguageLifecycle,
  urlStateHelper,
  versionFilterControl,
} from "../shared/unit-fixtures.mjs";
import { root } from "../shared/unit-fixture-data.mjs";

describe("explorer preferences and modes integration", () => {
  it("preserves explorer mode, font, and advanced filter guarantees", async () => {
    const arabicUiLocale = JSON.parse(
      await fs.readFile(path.join(root, "src/demo-locales/ui.ar.json"), "utf8"),
    ) as Record<string, string>;

    expect(demoHtml).toMatch(
      /class="basic-filter-grid"[\s\S]*class="filter-options"[\s\S]*class="setting-choice advanced-filters-trigger"/,
    );
    expect(helpSettingsDialogControlSource).toMatch(
      /ModeChoiceGroupControl\.toSpec\(\{\}\)/,
    );
    expect(demoHtml).toMatch(
      /class="filter-field version-field developer-only has-version-slider"/,
    );
    expect(versionFilterControl).toMatch(
      /function ensureVersionSliderControl[\s\S]*classList\.add\((["'])developer-only\1\)/,
    );
    expect(explorerPreferencesSource).toMatch(
      /parseExplorerModeParam[\s\S]*explorerModeFromUrl/,
    );
    expect(`${explorerUi}\n${developerModeControllerChangeSource}`).toMatch(
      /const mode = \(\) => state\.getExplorerMode\(\)[\s\S]*const enabled = auth\.canAccessAdvanced[\s\S]*const fullEnabled = auth\.canAccessDeveloper[\s\S]*const handler = \(event: any\) =>[\s\S]*preferences\.setString\((["'])mode\1,\s*nextMode\)/,
    );
    expect(urlStateHelper).toMatch(
      /if \(options\.explorerMode !== "standard"\)[\s\S]*params\.set\((["'])mode\1,\s*options\.explorerMode\)[\s\S]*if \(options\.emojiMode === (["'])editor\2\) params\.set\((["'])emojiMode\3,\s*(["'])editor\4\)/,
    );
    expect(
      `${explorerBootstrapSessionSource}\n${searchLanguageLifecycle}`,
    ).toMatch(
      /restoreDeveloperMode: \(\) => \{[\s\S]*explorerModeFromUrl =[\s\S]*parseExplorerModeParam[\s\S]*renderDeveloperMode\(\)[\s\S]*const onPopState[\s\S]*options\.restoreDeveloperMode\(\)[\s\S]*options\.applyDialogUrlState\(\)/,
    );
    expect(developerModeControllerChangeSource).toMatch(
      /preferences\.setString\((["'])mode\1,\s*nextMode\)[\s\S]*options\.syncUrlState\(\)/,
    );
    expect(searchLanguageLifecycle).toMatch(
      /const onPopState[\s\S]*options\.restoreDeveloperMode\(\)[\s\S]*options\.syncUrlState\(\)/,
    );
    expect(urlStateHelper).toMatch(
      /version:\s*options\.developerMode[\s\S]*versionMode:[\s\S]*options\.developerMode[\s\S]*if \(options\.explorerMode !== "standard"\) \{[\s\S]*params\.set\((["'])version\1/,
    );
    expect(demoStyles).toMatch(
      /html:not\(\[data-developer-mode\]\) \.developer-only,[\s\S]*\.advanced-only\s*\{\s*display:\s*none !important;/,
    );
    expect(demoStyles).toMatch(
      /html:not\(\[data-developer-mode\]\) \.example-dialog\[open\][\s\S]*grid-template-columns:\s*minmax\(0, 1fr\) 12rem;[\s\S]*width:\s*min\(44rem,/,
    );
    expect({
      helpAndSettings: arabicUiLocale.helpAndSettings,
      mode: arabicUiLocale.mode,
      standard: arabicUiLocale.standard,
      advanced: arabicUiLocale.advanced,
      developer: arabicUiLocale.developer,
    }).toEqual({
      helpAndSettings: "المساعدة والإعدادات",
      mode: "الوضع",
      standard: "قياسي",
      advanced: "متقدم",
      developer: "مطور",
    });
    expect(demoStyles).toMatch(
      /\.filter-picker-dialog \.compact-choices\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:/,
    );
    expect(demoHtml).not.toMatch(
      /class="basic-filter-grid"[\s\S]*class="compact-choices compact-group-choices"[\s\S]*class="filter-options"/,
    );
    expect(demoHtml).toMatch(
      /class="setting-choice advanced-filters-trigger"[\s\S]*aria-controls="advanced-filters-dialog"[\s\S]*class="advanced-filters-dialog"/,
    );
    expect(demoHtml).toMatch(
      /class="filter-picker-trigger group-picker-trigger"[\s\S]*id="group-filter-dialog"[\s\S]*class="compact-choices compact-group-choices"[\s\S]*id="subgroup-filter-dialog"/,
    );
    expect(filterPickerHelper).toMatch(
      /function openFilterPicker[\s\S]*showModal\(\)[\s\S]*function closeFilterPicker[\s\S]*trigger\?\.focus\(\)/,
    );
    expect(filterPickerHelper).toMatch(
      /function renderFilterPickerTrigger[\s\S]*filter-picker-emoji[\s\S]*filter-picker-value[\s\S]*aria-label/,
    );
    expect(demoStyles).toMatch(
      /\.search-controls\s*\{[^}]*max-width:\s*none;/,
    );
    expect(demoStyles).toMatch(
      /\.code\s*\{[\s\S]*direction:\s*ltr;[\s\S]*unicode-bidi:\s*isolate;[\s\S]*overflow-x:\s*auto;[\s\S]*white-space:\s*pre;[\s\S]*\.code-space\s*\{[\s\S]*display:\s*inline-block;[\s\S]*width:\s*0\.6ch;/,
    );
    expect(explorerUi).toMatch(
      /export function selectEmojiFont[\s\S]*dataset\.emojiFont[\s\S]*preferences\.setBoolean\((["'])pixelFont\1/,
    );
    expect(demoHtml).toMatch(
      /class="pixel-comparison"[\s\S]*class="emoji-font-choice emoji-font-choice-system"[\s\S]*data-emoji-font="system"[\s\S]*class="emoji-font-choice emoji-font-choice-pixel"[\s\S]*data-emoji-font="pixel"/,
    );
    expect(pixelEditorLoaderSource).toMatch(
      /createPixelEditor[\s\S]*is-editor-view/,
    );
    expect(demoScript).not.toMatch(/^import .*pixel-editor\.js/m);
    expect(demoScript).not.toMatch(
      /^import emoji from ['"]\.\/dist\/esm\/index\.js['"]/m,
    );
    expect(catalogLoader).toMatch(
      /state\.emojiByKey\.replace\(Object\.fromEntries\([\s\S]*item\.key, item\.emoji/,
    );
    expect(`${pixelArtwork}\n${explorerBootstrapShellSource}`).toMatch(
      /const refreshRenderedPixelEmoji[\s\S]*options\.refreshEditor\(\)[\s\S]*refreshEditor:\s*\(\)\s*=>\s*\{[\s\S]*is-editor-view[\s\S]*getPixelEditor\(\)\?\.refreshFontBuild/,
    );
    expect(urlStateHelper).toMatch(
      /emojiMode:\s*(["'])details\1\s*\|\s*(["'])code\2\s*\|\s*(["'])editor\3[\s\S]*params\.set\((["'])emojiMode\4,\s*(["'])editor\5\)/,
    );
    expect(`${explorerUi}\n${explorerBootstrapShellSource}`).toMatch(
      /!preferences\.getBoolean\((["'])pixelFont\1\)/,
    );
    expect(pixelArtwork).toMatch(
      /const renderedPixelEmoji[\s\S]*privateUseByKey[\s\S]*String\.fromCodePoint\(privateUsePoint\)/,
    );
    expect(`${pwaPanelsHelper}`).toMatch(/panelDialogEntry/);
    expect(arabicDemo).toBeTruthy();
  });
});
