import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  demoHtml,
  demoStyles,
  emojiListInteractionHelper,
  emojiListRenderHelper,
  explorerApp,
  listController,
  loadingState,
  renderingDiagnosticHelper,
  root
} from '../shared/unit-fixtures.mjs';

assert.match(
  renderingDiagnosticHelper,
  /systemEmojiAppearsSplit[\s\S]*systemRenderingSplit/,
  'emoji details must report split system sequences'
);
assert.match(
  demoStyles,
  /@media \(max-width: 560px\)[\s\S]*\.example-dialog\[open\][\s\S]*position:\s*fixed;[\s\S]*inset:\s*max\(0\.5rem, env\(safe-area-inset-top\)\) 0\.5rem auto;[\s\S]*height:\s*auto;[\s\S]*max-height:\s*calc\([\s\S]*safe-area-inset-bottom/,
  'mobile emoji details must use its natural height within a safe-area-aware fixed sheet'
);
assert.match(
  demoStyles,
  /\.subgroup \.emoji > div,[\s\S]*width:\s*2\.75rem;[\s\S]*height:\s*2\.75rem;/,
  'emoji results must provide 44 CSS-pixel pointer targets'
);
assert.match(
  emojiListRenderHelper,
  /versionDescription[\s\S]*setAttribute\('aria-label', `\$\{accessibleName\}\$\{versionDescription\}`\)/,
  'emoji result labels must include their introduction version'
);
assert.doesNotMatch(
  demoHtml,
  /class="emoji-code-points"/,
  'code points must not be repeated in a metadata card'
);
assert.match(
  await fs.readFile(path.join(root, 'src/app/startup-orchestrator.ts'), 'utf8'),
  /\.emoji-code-points'\)\?\.closest\('div'\)\?\.remove/,
  'cached code-point metadata rows must be removed'
);
assert.match(
  demoHtml,
  /class="pixel-comparison"[\s\S]*data-emoji-font="system"[\s\S]*data-emoji-font="pixel"/,
  'demo must let the comparison previews select the preferred emoji font'
);
assert.match(
  demoHtml,
  /class="pixel-hero"[\s\S]*pixel-comparison-system[\s\S]*pixel-comparison-custom/,
  'the Explorer must introduce Pixel Emoji with a system comparison'
);
assert.match(
  demoHtml,
  /name="description"[\s\S]*original 12×12 Pixel Emoji font/,
  'search metadata must identify the original Pixel Emoji font'
);
assert.match(
  demoHtml,
  /"featureList":\s*\[[\s\S]*"Original 12×12 Pixel Emoji font"[\s\S]*"System-versus-pixel rendering diagnostics"/,
  "structured metadata must expose the Explorer's distinguishing Pixel Emoji features"
);
assert.match(
  demoHtml,
  /class="list is-loading"[\s\S]*data-i18n="loadingExplorer"[\s\S]*class="loading-grid"/,
  'the initial page must present an intentional loading state'
);
assert.match(
  loadingState,
  /function finishExplorerLoading[\s\S]*if \(options\.emojiList\.dataset\.rendering !== 'true'\) options\.revealExplorer\(\)[\s\S]*function revealExplorer[\s\S]*classList\.remove\('app-loading'\)[\s\S]*aria-busy[\s\S]*result-count'\)!\.hidden = false/,
  'loading controls and below-list content must be revealed only after the first result tree is ready'
);
assert.match(
  emojiListInteractionHelper,
  /const finishEmojiListRender[\s\S]*options\.revealExplorer\(\)/,
  'loading controls and below-list content must be revealed only after the first result tree is ready'
);
assert.match(
  demoStyles,
  /\.app-loading \.result-count,[\s\S]*visibility:\s*hidden;[\s\S]*\.app-loading \.about-explorer\s*\{\s*display:\s*none;/,
  'initial loading must reserve toolbar geometry without positioning About beneath the skeleton'
);
assert.match(
  demoHtml,
  /initialUrlParams = new URLSearchParams\(location\.search\)[\s\S]*initialDeveloperMode[\s\S]*initialPreferences\.developerMode === true[\s\S]*initialUrlParams\.get\("developer"\)[\s\S]*data-developer-mode/,
  'Developer mode must be applied before the fixed browse footer is painted'
);
assert.match(
  demoStyles,
  /\.list\s*\{[^}]*position:\s*relative;[\s\S]*\.list\.is-loading\s*\{[^}]*100svh[\s\S]*\.loading-state\s*\{[^}]*position:\s*absolute;/,
  'the initial loading presentation must overlay a viewport-sized result region'
);
assert.match(
  demoStyles,
  /\.order-footer\s*\{[\s\S]*display:\s*flex;[\s\S]*flex-wrap:\s*wrap;[\s\S]*justify-content:\s*flex-end;[\s\S]*\.install-app\s*\{[\s\S]*display:\s*inline-flex;[\s\S]*@media \(min-width:\s*561px\)\s*\{[\s\S]*\.install-app\s*\{[\s\S]*order:\s*-1;[\s\S]*margin-inline-end:\s*0\.25rem;/,
  'the deferred PWA install action must not resize the fixed browse footer'
);
assert.match(
  `${explorerApp}\n${listController}`,
  /options\.searchText\.addEventListener\('input', options\.scheduleSearchDraw\)[\s\S]*const schedule[\s\S]*window\.clearTimeout\(timer\)[\s\S]*window\.setTimeout\([\s\S]*draw\(\)[\s\S]*200\)/,
  'rapid search input must coalesce expensive emoji-list renders'
);
assert.match(
  emojiListInteractionHelper,
  /const finishEmojiListRender[\s\S]*replaceChildren\(renderRoot\)[\s\S]*const renderEmojiList[\s\S]*renderRoot = document\.createDocumentFragment\(\)[\s\S]*aria-busy[\s\S]*performance\.now\(\) \+ 6[\s\S]*Math\.min\(keyIndex \+ 120[\s\S]*renderRoot\.appendChild\(fragment\)[\s\S]*yieldForListRender\(\)\.then\(renderChunk\)/,
  'large emoji result sets must build in cancellable, off-document chunks before one stable swap'
);
assert.match(
  emojiListRenderHelper,
  /const flushEmojiCellFragment[\s\S]*DocumentFragment[\s\S]*const asItem[\s\S]*flushEmojiCellFragment\(state\)[\s\S]*state\.cellFragment\?\.appendChild\(cell\)[\s\S]*const asSequenceItem[\s\S]*state\.cellFragment\?\.appendChild/,
  'incremental result chunks must batch emoji cells outside the live document'
);
assert.match(
  demoStyles,
  /\.list\s*\{[^}]*contain:\s*layout style;/,
  'emoji result layout must be contained from the surrounding interface'
);
assert.match(
  demoStyles,
  /\.pixel-hero\s*\{[^}]*min-height:\s*7rem;[^}]*contain:\s*layout style;[\s\S]*\.pixel-comparison > button\s*\{[^}]*width:\s*4rem;/,
  'the Pixel Emoji introduction must reserve stable dimensions while fonts load'
);
