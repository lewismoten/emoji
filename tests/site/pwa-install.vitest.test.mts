import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

type WebAppManifest = {
  id: string;
  start_url: string;
  scope: string;
  display: string;
  icons: { sizes: string }[];
};

const root = path.resolve(process.cwd());
const read = (file: string) => fs.readFile(path.join(root, file), "utf8");
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
const readJson = async <T,>(file: string) => JSON.parse(await read(file)) as T;

describe("site/pwa-install", () => {
  it("keeps install behavior, manifests, and mobile styling intact", async () => {
    const webAppManifest = await readJson<WebAppManifest>(
      "src/site/pwa/manifest.webmanifest",
    );
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
      read("src/site/index.html"),
      read("src/index.ts"),
      Promise.all([
        read("src/explorer-app.ts"),
        read("src/app/explorer-app-events.ts"),
        read("src/app/emoji/explorer-app-events-runtime.ts"),
      ]).then((parts) => parts.join("\n")),
      read("src/app/explorer-shell.ts"),
      read("src/explorer/pwa/pwa-panels.ts"),
      Promise.all([
        read("src/site/themes/base-theme.css"),
        read("src/site/themes/dark.css"),
        read("src/site/themes/light/light.css"),
        read("src/site/themes/ega.css"),
        read("src/site/themes/retro/retro.css"),
        read("src/site/themes/retro/retro-foundation.css"),
        read("src/site/themes/retro/retro-dialogs.css"),
        read("src/site/themes/retro/retro-example-dialogs.css"),
        read("src/site/themes/retro/retro-buttons.css"),
        read("src/site/themes/retro/retro-choice-states.css"),
        read("src/site/themes/retro/retro-typography.css"),
        read("src/site/themes/retro/retro-forms.css"),
        read("src/site/themes/retro/retro-focus.css"),
        read("src/site/styles/toolbar-controls.css"),
        read("src/site/styles/dialog-controls.css"),
        readCssWithImports("src/site/index.css"),
      ]).then((parts) => parts.join("\n")),
      read("build/demo-pages/index.ar.html"),
      read("config/vite.config.js"),
      read("src/explorer/toolbar/toolbar-layout.ts"),
    ]);

    expect(webAppManifest.id).toBe("./");
    expect(webAppManifest.start_url).toBe("./");
    expect(webAppManifest.scope).toBe("./");
    expect(webAppManifest.display).toBe("standalone");
    expect(arabicWebAppManifest.id).toBe("./");
    expect(arabicWebAppManifest.name).toBe("مستكشف الرموز التعبيرية");
    expect(arabicWebAppManifest.lang).toBe("ar");
    expect(arabicWebAppManifest.dir).toBe("rtl");
    expect(arabicWebAppManifest.start_url).toBe("./index.ar.html");
    expect(arabicDemo).toMatch(
      /<link rel="manifest" href="\.\/manifest\.ar\.webmanifest">/,
    );
    expect(webAppManifest.icons.map((icon) => icon.sizes)).toEqual([
      "192x192",
      "512x512",
      "512x512",
    ]);
    expect(demoHtml).toMatch(
      /class="order-footer"[\s\S]*class="install-app"[^>]*hidden[^>]*data-i18n-aria-label="installApp"[\s\S]*class="order-buttons"/,
    );
    expect(pwaPanelsHelper).toMatch(
      /function installApp[\s\S]*promptEvent\.prompt\(\)[\s\S]*promptEvent\.userChoice/,
    );
    expect(pwaPanelsHelper).toMatch(
      /const trigger =[\s\S]*event\?\.currentTarget[\s\S]*await promptEvent\.userChoice[\s\S]*trigger\?\.blur\?\.\(\)/,
    );
    expect(toolbarLayout).toMatch(
      /ResizeObserver\(\(\[entry\]\)[\s\S]*borderBoxSize[\s\S]*contentRect\.height[\s\S]*requestAnimationFrame/,
    );
    expect(`${demoScript}\n${explorerShell}\n${explorerApp}`).toMatch(
      /beforeinstallprompt[\s\S]*event\.preventDefault\(\)[\s\S]*deferredInstallPrompt = event/,
    );
    expect(pwaPanelsHelper).toMatch(
      /function renderInstallAppButton[\s\S]*isInstalledApp\(\)/,
    );
    expect(`${demoScript}\n${explorerShell}\n${explorerApp}`).toMatch(
      /appinstalled[\s\S]*deferredInstallPrompt = undefined/,
    );
    expect(pwaPanelsHelper).toMatch(
      /getInstalledDisplayQueries[\s\S]*standalone[\s\S]*fullscreen[\s\S]*minimal-ui[\s\S]*window-controls-overlay[\s\S]*android-app:\/\//,
    );
    expect(explorerShell).toMatch(
      /appinstalled[\s\S]*installAppButton\.hidden = true/,
    );
    expect(explorerApp).toMatch(
      /installedDisplayQueries\.forEach[\s\S]*change/,
    );
    expect(demoStyles).toMatch(
      /@media \(display-mode: standalone\)[\s\S]*window-controls-overlay[\s\S]*\.install-app\s*\{\s*display:\s*none !important;/,
    );
    expect(demoStyles).toMatch(
      /--emoji-font:\s*var\(--pixel-emoji-released-family[\s\S]*var\(--pixel-emoji-proposed-family[\s\S]*\.(?:modifier-emoji|emoji-glyph|emoji-preview-glyph|emoji-composition-glyph)\.has-proposed-pixel-art[\s\S]*var\(--pixel-emoji-proposed-family[\s\S]*var\(--emoji-font\)/,
    );
    expect(pwaPanelsHelper).toMatch(
      /isIosDevice[\s\S]*Add to Home Screen|isIosDevice[\s\S]*installDialog\?\.showModal/,
    );
    expect(pwaPanelsHelper).toMatch(
      /userAgentData\?\.platform[\s\S]*toLowerCase\(\) === (["'])macos\1[\s\S]*return false/,
    );
    expect(pwaPanelsHelper).toMatch(
      /install-instructions-ios[\s\S]*install-instructions-browser[\s\S]*browserInstructions\.hidden = ios/,
    );
    expect(viteConfig).toMatch(
      /localizedManifestPattern[\s\S]*application\/manifest\+json[\s\S]*renderManifest\(/,
    );
    expect(demoStyles).toMatch(
      /\.install-app\[hidden\]\s*\{\s*display:\s*inline-flex;[\s\S]*visibility:\s*hidden;[\s\S]*pointer-events:\s*none;[\s\S]*@media \(max-width: 560px\)[\s\S]*\.install-app-label\s*\{\s*display:\s*none;/,
    );
  });
});
