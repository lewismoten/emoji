import fs from "node:fs";
import { defineConfig } from "vite";
import path from "node:path";
import {
  locales,
  renderManifest,
  renderPage,
} from "./scripts/generate-demo-pages.mjs";
import { renderServiceWorker } from "./scripts/generate-service-worker.mjs";

const localizedPagePattern = /^\/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/;
const localizedManifestPattern =
  /^\/manifest\.([a-z]{2,3}(?:-[A-Z]{2})?)\.webmanifest$/;
const iconAssetPattern =
  /^\/icons\/(icon-192\.png|icon-512\.png|icon-maskable-512\.png|icon\.svg|icon-maskable\.svg)$/;
const fallbackIconPng = ["src/site/screenshot.png", "docs/assets/social-preview.png"]
  .map((file) => path.resolve(file))
  .find((file) => fs.existsSync(file));
const fallbackIconSvg = path.resolve("src/site/favicon.svg");
const pixelFontStylesheet = path.resolve(
  "pixel-font/build/font/pixel-emoji.css",
);
const pixelFontRevision = path.resolve("pixel-font/font-build.revision");

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
          if (pathname.startsWith("/pixel-font/build/font/")) {
            response.setHeader("Cache-Control", "no-store");
          }
          if (pathname === "/favicon.svg" && ["GET", "HEAD"].includes(method)) {
            response.statusCode = 200;
            response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
            response.setHeader("Cache-Control", "no-cache");
            response.end(
              method === "HEAD"
                ? undefined
                : fs.readFileSync(fallbackIconSvg),
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

          const locale = pathname.match(localizedPagePattern)?.[1];
          if (
            !locale ||
            !locales.includes(locale) ||
            !["GET", "HEAD"].includes(method)
          ) {
            next();
            return;
          }

          try {
            const developmentPage = renderPage(
              locale,
              `http://localhost${pathname}`,
            ).replace(
              /<script defer src="\.\/index\.js\?v=[^"]+" type="module"><\/script>/,
              '<script defer src="./src/index.ts" type="module"></script>',
            );
            const html = await server.transformIndexHtml(
              pathname,
              developmentPage,
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
