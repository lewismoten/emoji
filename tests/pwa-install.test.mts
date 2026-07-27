import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type WebAppManifest = {
  id: string;
  start_url: string;
  scope: string;
  display: string;
  icons: { sizes: string }[];
};

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;
const webAppManifest = await readJson<WebAppManifest>("manifest.webmanifest");
const arabicWebAppManifest = await readJson<{
  id: string;
  name: string;
  lang: string;
  dir: string;
  start_url: string;
}>("build/demo-pages/manifest.ar.webmanifest");
const [
  demoHtml,
  demoScript,
  explorerApp,
  explorerShell,
  pwaPanelsHelper,
  demoStyles,
  arabicDemo,
  viteConfig,
  toolbarLayout,
] = await Promise.all([
  read("index.html"),
  read("src/index.ts"),
  read("src/explorer-app.ts"),
  read("src/app/explorer-shell.ts"),
  read("src/explorer/pwa-panels.ts"),
  read("index.css"),
  read("build/demo-pages/index.ar.html"),
  read("vite.config.js"),
  read("src/explorer/toolbar-layout.ts"),
]);

assert.equal(
  webAppManifest.id,
  "./",
  "web app manifest ID must remain within the GitHub Pages project scope",
);
assert.equal(
  webAppManifest.start_url,
  "./",
  "web app must start at the GitHub Pages project root",
);
assert.equal(
  webAppManifest.scope,
  "./",
  "web app scope must remain within the GitHub Pages project",
);
assert.equal(
  webAppManifest.display,
  "standalone",
  "installed web app must use standalone display mode",
);
assert.equal(
  arabicWebAppManifest.id,
  "./",
  "localized manifests must identify the same installed application",
);
assert.equal(
  arabicWebAppManifest.name,
  "مستكشف الرموز التعبيرية",
  "localized manifests must use the selected language application name",
);
assert.equal(arabicWebAppManifest.lang, "ar");
assert.equal(arabicWebAppManifest.dir, "rtl");
assert.equal(
  arabicWebAppManifest.start_url,
  "./index.ar.html",
  "a localized installation must launch in its selected language",
);
assert.match(
  arabicDemo,
  /<link rel="manifest" href="\.\/manifest\.ar\.webmanifest">/,
  "localized pages must advertise their localized installation manifest",
);
assert.deepEqual(
  webAppManifest.icons.map((icon) => icon.sizes),
  ["192x192", "512x512", "512x512"],
  "web app must provide standard and maskable install icons",
);
assert.match(
  demoHtml,
  /class="order-footer"[\s\S]*class="install-app"[^>]*hidden[^>]*data-i18n-aria-label="installApp"[\s\S]*class="order-buttons"/,
  "the sticky footer must contain an initially hidden accessible install action",
);
assert.match(
  pwaPanelsHelper,
  /function installApp[\s\S]*promptEvent\.prompt\(\)[\s\S]*promptEvent\.userChoice/,
  "the install action must invoke the retained browser PWA installation prompt",
);
assert.match(
  pwaPanelsHelper,
  /const trigger =[\s\S]*event\?\.currentTarget[\s\S]*await promptEvent\.userChoice[\s\S]*trigger\?\.blur\?\.\(\)/,
  "the install action must retain its trigger before awaiting the browser prompt",
);
assert.match(
  toolbarLayout,
  /ResizeObserver\(\(\[entry\]\)[\s\S]*borderBoxSize[\s\S]*contentRect\.height[\s\S]*requestAnimationFrame/,
  "toolbar sizing must avoid a synchronous startup layout measurement",
);
assert.match(
  `${demoScript}\n${explorerShell}\n${explorerApp}`,
  /beforeinstallprompt[\s\S]*event\.preventDefault\(\)[\s\S]*deferredInstallPrompt = event/,
  "the browser PWA installation prompt must be retained for the footer action",
);
assert.match(
  pwaPanelsHelper,
  /function renderInstallAppButton[\s\S]*isInstalledApp\(\)/,
  "the install action must derive its visibility from installed-app detection",
);
assert.match(
  `${demoScript}\n${explorerShell}\n${explorerApp}`,
  /appinstalled[\s\S]*deferredInstallPrompt = undefined/,
  "the install action must clear the retained prompt after the app is installed",
);
assert.match(
  pwaPanelsHelper,
  /installedDisplayQueries[\s\S]*standalone[\s\S]*fullscreen[\s\S]*minimal-ui[\s\S]*window-controls-overlay[\s\S]*android-app:\/\//,
  "installed app detection must cover supported standalone display contexts",
);
assert.match(
  `${demoScript}\n${explorerShell}\n${explorerApp}`,
  /appinstalled[\s\S]*installAppButton\.hidden = true[\s\S]*installedDisplayQueries\.forEach[\s\S]*change/,
  "installation and display-mode changes must immediately hide the install action",
);
assert.match(
  demoStyles,
  /@media \(display-mode: standalone\)[\s\S]*window-controls-overlay[\s\S]*\.install-app\s*\{\s*display:\s*none !important;/,
  "installed display modes must hide the install action independently of JavaScript",
);
assert.match(
  demoStyles,
  /--emoji-font:\s*var\(--pixel-emoji-released-family[\s\S]*var\(--pixel-emoji-proposed-family[\s\S]*\.has-proposed-pixel-art[\s\S]*var\(--pixel-emoji-proposed-family/,
  "released artwork must prefer the released font while proposed artwork explicitly promotes the proposed font",
);
assert.match(
  pwaPanelsHelper,
  /isIosDevice[\s\S]*Add to Home Screen|isIosDevice[\s\S]*installDialog\?\.showModal/,
  "iOS users must receive manual Add to Home Screen instructions",
);
assert.match(
  pwaPanelsHelper,
  /userAgentData\?\.platform[\s\S]*toLowerCase\(\) === (["'])macos\1[\s\S]*return false/,
  "macOS device emulation must not be mistaken for a real iOS installation",
);
assert.match(
  pwaPanelsHelper,
  /install-instructions-ios[\s\S]*install-instructions-browser[\s\S]*browserInstructions\.hidden = ios/,
  "browsers without a native prompt must receive platform-appropriate installation instructions",
);
assert.match(
  viteConfig,
  /localizedManifestPattern[\s\S]*application\/manifest\+json[\s\S]*renderManifest\(/,
  "the Vite development server must return JSON for localized web app manifests",
);
assert.match(
  demoStyles,
  /\.install-app\[hidden\]\s*\{\s*display:\s*inline-flex;[\s\S]*visibility:\s*hidden;[\s\S]*pointer-events:\s*none;[\s\S]*@media \(max-width: 560px\)[\s\S]*\.install-app-label\s*\{\s*display:\s*none;/,
  "the footer install action must stay compact on mobile screens",
);
