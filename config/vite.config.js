import fs from "node:fs";
import { defineConfig } from "vite";
import path from "node:path";
import {
  locales,
  renderManifest,
  renderPage,
} from "../scripts/generate-demo-pages.mjs";
import { renderServiceWorker } from "../scripts/generate-service-worker.mjs";

const localizedPagePattern = /^\/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/;
const localizedManifestPattern =
  /^\/manifest\.([a-z]{2,3}(?:-[A-Z]{2})?)\.webmanifest$/;
const iconAssetPattern =
  /^\/icons\/(icon-192\.png|icon-512\.png|icon-maskable-512\.png|icon\.svg|icon-maskable\.svg)$/;
const fallbackIconPng = [
  "src/site/screenshot.png",
  "docs/assets/social-preview.png",
]
  .map((file) => path.resolve(file))
  .find((file) => fs.existsSync(file));
const fallbackIconSvg = path.resolve("src/site/favicon.svg");
const pixelFontStylesheet = path.resolve(
  "pixel-font/build/font/pixel-emoji.css",
);
const pixelFontRevision = path.resolve("pixel-font/font-build.revision");
const devJsonAssetPaths = new Map([
  ["/demo-locales/", path.resolve("src/demo-locales")],
  ["/locales/", path.resolve("src/data/locales")],
  ["/orders/", path.resolve("src/data/orders")],
  ["/versions/", path.resolve("src/data/versions")],
  ["/proposed/", path.resolve("src/data/proposed")],
]);
const devStylesheetRewrites = new Map([
  ["./explorer/themes/base-theme.css", "./src/site/themes/base-theme.css"],
  ["./explorer/themes/dark.css", "./src/site/themes/dark.css"],
  ["./explorer/themes/light/light.css", "./src/site/themes/light/light.css"],
  ["./explorer/themes/ega.css", "./src/site/themes/ega.css"],
  ["./explorer/themes/retro/retro.css", "./src/site/themes/retro/retro.css"],
  [
    "./explorer/themes/retro/retro-foundation.css",
    "./src/site/themes/retro/retro-foundation.css",
  ],
  [
    "./explorer/themes/retro/retro-dialogs.css",
    "./src/site/themes/retro/retro-dialogs.css",
  ],
  [
    "./explorer/themes/retro/retro-example-dialogs.css",
    "./src/site/themes/retro/retro-example-dialogs.css",
  ],
  [
    "./explorer/themes/retro/retro-buttons.css",
    "./src/site/themes/retro/retro-buttons.css",
  ],
  [
    "./explorer/themes/retro/retro-forms.css",
    "./src/site/themes/retro/retro-forms.css",
  ],
  [
    "./explorer/themes/retro/retro-focus.css",
    "./src/site/themes/retro/retro-focus.css",
  ],
  ["./explorer/toolbar-controls.css", "./src/site/styles/toolbar-controls.css"],
  ["./explorer/dialog-controls.css", "./src/site/styles/dialog-controls.css"],
  [
    "./explorer/controls/dialog/dialog-close-button.css",
    "./src/controls/dialog/dialog-close-button.css",
  ],
  [
    "./explorer/controls/dialog/dialog-heading.css",
    "./src/controls/dialog/dialog-heading.css",
  ],
  [
    "./explorer/controls/dialog/dialog-navigate-button.css",
    "./src/controls/dialog/dialog-navigate-button.css",
  ],
  [
    "./explorer/controls/dialog/dialog-mode-back-button.css",
    "./src/controls/dialog/dialog-mode-back-button.css",
  ],
  [
    "./explorer/controls/pickers/language-picker.css",
    "./src/controls/pickers/language-picker.css",
  ],
  [
    "./explorer/controls/filters/pickers/compact-choice-button.css",
    "./src/controls/filters/pickers/compact-choice-button.css",
  ],
  [
    "./explorer/controls/toolbar/theme-choice-group.css",
    "./src/controls/toolbar/theme-choice-group.css",
  ],
  [
    "./explorer/controls/filters/pickers/filter-picker-trigger.css",
    "./src/controls/filters/pickers/filter-picker-trigger.css",
  ],
  [
    "./explorer/controls/toolbar/toolbar-trigger-button.css",
    "./src/controls/toolbar/toolbar-trigger-button.css",
  ],
  [
    "./explorer/controls/filters/pickers/advanced-filters-trigger.css",
    "./src/controls/filters/pickers/advanced-filters-trigger.css",
  ],
  [
    "./explorer/controls/filters/modifiers/modifier-filter-control.css",
    "./src/controls/filters/modifiers/modifier-filter-control.css",
  ],
  [
    "./explorer/controls/filters/version/version-mode-toggle.css",
    "./src/controls/filters/version/version-mode-toggle.css",
  ],
  [
    "./explorer/controls/filters/version/version-step-button.css",
    "./src/controls/filters/version/version-step-button.css",
  ],
  ["./explorer/index.css", "./src/site/index.css"],
]);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const rewriteDevelopmentStylesheets = (html) => {
  let result = html;
  for (const [generatedHref, sourceHref] of devStylesheetRewrites) {
    const pattern = new RegExp(
      `href="${escapeRegExp(generatedHref)}(?:\\?[^"]*)?"`,
      "g",
    );
    result = result.replace(pattern, `href="${sourceHref}"`);
  }
  return result;
};

export default defineConfig({
  server: {
    watch: {
      ignored: ["**/pixel-font/build/**"],
    },
  },
  plugins: [
    {
      name: "localized-demo-pages",
      configureServer(server) {
        server.watcher.add(pixelFontRevision);
        server.watcher.on("all", (event, file) => {
          if (file === pixelFontRevision && ["add", "change"].includes(event)) {
            server.ws.send({
              type: "custom",
              event: "pixel-font:updated",
              data: { revision: Date.now() },
            });
          }
        });
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? "/", "http://localhost")
            .pathname;
          const method = request.method ?? "GET";
          const isRootPage = pathname === "/" || pathname === "/index.html";
          if (pathname.startsWith("/pixel-font/build/font/")) {
            response.setHeader("Cache-Control", "no-store");
          }
          for (const [publicPrefix, sourceDirectory] of devJsonAssetPaths) {
            if (
              pathname.startsWith(publicPrefix) &&
              ["GET", "HEAD"].includes(method)
            ) {
              const relativePath = pathname.slice(publicPrefix.length);
              const source = path.join(sourceDirectory, relativePath);
              if (!fs.existsSync(source)) {
                response.statusCode = 404;
                response.end(method === "HEAD" ? undefined : "Not found");
                return;
              }
              response.statusCode = 200;
              response.setHeader(
                "Content-Type",
                "application/json; charset=utf-8",
              );
              response.setHeader("Cache-Control", "no-cache");
              response.end(
                method === "HEAD" ? undefined : fs.readFileSync(source),
              );
              return;
            }
          }
          if (pathname === "/favicon.svg" && ["GET", "HEAD"].includes(method)) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
            response.setHeader("Cache-Control", "no-cache");
            response.end(
              method === "HEAD" ? undefined : fs.readFileSync(fallbackIconSvg),
            );
            return;
          }
          const iconMatch = pathname.match(iconAssetPattern);
          if (iconMatch && ["GET", "HEAD"].includes(method)) {
            const requested = iconMatch[1];
            const isSvg = requested.endsWith(".svg");
            const source = isSvg ? fallbackIconSvg : fallbackIconPng;
            if (!source || !fs.existsSync(source)) {
              response.statusCode = 404;
              response.end(method === "HEAD" ? undefined : "Not found");
              return;
            }
            response.statusCode = 200;
            response.setHeader(
              "Content-Type",
              isSvg ? "image/svg+xml; charset=utf-8" : "image/png",
            );
            response.setHeader("Cache-Control", "no-cache");
            response.end(
              method === "HEAD" ? undefined : fs.readFileSync(source),
            );
            return;
          }
          if (
            pathname === "/service-worker.js" &&
            ["GET", "HEAD"].includes(method)
          ) {
            response.statusCode = 200;
            response.setHeader(
              "Content-Type",
              "text/javascript; charset=utf-8",
            );
            response.setHeader("Cache-Control", "no-cache");
            response.setHeader("Service-Worker-Allowed", "/");
            response.end(method === "HEAD" ? undefined : renderServiceWorker());
            return;
          }

          const manifestLocale = pathname.match(localizedManifestPattern)?.[1];
          if (
            manifestLocale &&
            locales.includes(manifestLocale) &&
            ["GET", "HEAD"].includes(method)
          ) {
            response.statusCode = 200;
            response.setHeader(
              "Content-Type",
              "application/manifest+json; charset=utf-8",
            );
            response.setHeader("Cache-Control", "no-cache");
            response.end(
              method === "HEAD"
                ? undefined
                : renderManifest(
                    manifestLocale,
                    `./index.${manifestLocale}.html`,
                  ),
            );
            return;
          }

          const locale = isRootPage
            ? "en"
            : pathname.match(localizedPagePattern)?.[1];
          if (
            (!isRootPage && !locale) ||
            !locales.includes(locale) ||
            !["GET", "HEAD"].includes(method)
          ) {
            next();
            return;
          }

          try {
            const developmentPage = renderPage(
              locale,
              isRootPage ? "http://localhost/" : `http://localhost${pathname}`,
              isRootPage ? "en-US" : locale,
              locale,
              isRootPage ? "" : locale,
            ).replace(
              /<script defer src="\.\/index\.js\?v=[^"]+" type="module"><\/script>/,
              '<script defer src="./src/index.ts" type="module"></script>',
            );
            const developmentPageWithSourceStyles =
              rewriteDevelopmentStylesheets(developmentPage);
            const html = await server.transformIndexHtml(
              isRootPage ? "/index.html" : pathname,
              developmentPageWithSourceStyles,
            );
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(method === "HEAD" ? undefined : html);
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
});
