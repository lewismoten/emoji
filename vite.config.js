import { defineConfig } from 'vite';
import { locales, renderPage } from './scripts/generate-demo-pages.mjs';

const localizedPagePattern = /^\/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/;

export default defineConfig({
  plugins: [
    {
      name: 'localized-demo-pages',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
          const locale = pathname.match(localizedPagePattern)?.[1];
          if (!locale || !locales.includes(locale) || !['GET', 'HEAD'].includes(request.method ?? 'GET')) {
            next();
            return;
          }

          try {
            const html = await server.transformIndexHtml(pathname, renderPage(locale, `http://localhost${pathname}`));
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(request.method === 'HEAD' ? undefined : html);
          } catch (error) {
            next(error);
          }
        });
      }
    }
  ]
});
