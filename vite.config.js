import { defineConfig } from 'vite';
import { locales, renderPage } from './scripts/generate-demo-pages.mjs';
import { renderServiceWorker } from './scripts/generate-service-worker.mjs';

const localizedPagePattern = /^\/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/;

export default defineConfig({
  plugins: [
    {
      name: 'localized-demo-pages',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
          const method = request.method ?? 'GET';
          if (pathname === '/service-worker.js' && ['GET', 'HEAD'].includes(method)) {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
            response.setHeader('Cache-Control', 'no-cache');
            response.setHeader('Service-Worker-Allowed', '/');
            response.end(method === 'HEAD' ? undefined : renderServiceWorker());
            return;
          }

          const locale = pathname.match(localizedPagePattern)?.[1];
          if (!locale || !locales.includes(locale) || !['GET', 'HEAD'].includes(method)) {
            next();
            return;
          }

          try {
            const html = await server.transformIndexHtml(pathname, renderPage(locale, `http://localhost${pathname}`));
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(method === 'HEAD' ? undefined : html);
          } catch (error) {
            next(error);
          }
        });
      }
    }
  ]
});
