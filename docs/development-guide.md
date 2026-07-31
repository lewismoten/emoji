# Development guide

## Running Emoji Explorer locally

After the first successful visit, the Explorer and its core Unicode data work
offline. Search-language packs are cached after they are selected once.

For the short answer, a normal first run is still:

```bash
npm install
npm start
```

That works when the committed generated assets are already present, which is
the normal repository state.

If you changed generated inputs such as Unicode data, package packs, pixel-font
atlases, retro text sources, or Newspeak generation, follow the matching
workflow in [docs/npm-scripts.md](npm-scripts.md) first.

Run the demo locally with Vite:

```bash
npm install
npm start
```

Then open <http://localhost:5173/>. Localized routes such as
<http://localhost:5173/index.ar.html> are generated in memory by Vite.

When you want to test the exact published output instead of the Vite
development server, use:

```bash
npm run website:staging
```

That builds the deployable site bundle, validates it, starts a plain static
server, and prints the URL to open. It is the best choice when you want to
verify the final minified site, lazy-loaded assets, PWA manifests, and service
worker behavior before publishing.

## Publishing the website

Build a complete, validated copy of the Emoji Explorer and Pixel Emoji fonts
for <https://emoji.lewismoten.com/>:

```bash
npm run website:build
```

The deployable files are written to `build/website`. The command builds the
package and fonts, generates every localized page and PWA manifest with the
custom domain’s canonical URLs, creates the service worker, and verifies its
precache assets and browser fonts.

Recommended end-to-end publish order:

1. `npm install`
2. create the Python environment if you have not already
3. `npm run website:staging`
4. verify the staged output in a browser
5. `npm run website:publish -- --target <destination>`

The matching prerequisites and command variants are listed in
[docs/npm-scripts.md](npm-scripts.md).

Publish over SSH with `rsync` by supplying your server destination:

```bash
npm run website:publish -- --target user@example.com:/var/www/emoji/
```

The current custom-domain server can be published with:

```bash
npm run website:publish -- \
  --identity ~/.ssh/id_rsa \
  --transport tar \
  --target {username}@{host}:{path}
```

The SSH key’s passphrase prompt remains interactive. Set
`EMOJI_DEPLOY_TARGET`, `EMOJI_SSH_IDENTITY`, and
`EMOJI_DEPLOY_TRANSPORT=tar` to avoid repeating the destination, identity, and
transport. The automatic transport also falls back to `tar` over SSH when the
server does not have `rsync`. The tar stream excludes macOS extended attributes
and provenance metadata. Existing remote files are preserved by default;
`--delete` requires `rsync` and should only be used when the target directory
is dedicated to this site. Use `--skip-build` to redeploy existing compiled
assets, or override the canonical origin with `--url`.

DNS, HTTPS certificates, and the web server’s document-root configuration are
managed by the hosting provider and are intentionally outside this script.

## Development scripts

For the complete npm script inventory, including prerequisites such as Python,
SSH, `rsync`, or network access where needed, see
[docs/npm-scripts.md](npm-scripts.md).

Commonly used commands:

- `npm run clean` removes generated `build` and `dist` directories.
- `npm run build` regenerates the library and compiles TypeScript.
- `npm run bundle` produces the publishable JavaScript and TypeScript files and
  refreshes the repository-tracked SVG and PNG preview assets.
- `npm test` builds the package and verifies Unicode releases, public package
  specifiers, TypeScript declarations, localized demo pages, and PWA assets.
- `npm start` runs the local Emoji Explorer.
- `npm run website:staging` builds and serves the exact published site without
  Vite.
- `npm run website:build` creates and validates `build/website` for
  `emoji.lewismoten.com`.
- `npm run website:publish -- --target <destination>` builds and uploads the
  site over SSH.
- `npm run svg:render` synchronizes the site icon smiley from the configured
  pixel-font atlas source and rerenders tracked SVG-to-PNG assets such as the
  social preview image.
- `npm run pixel-font:build` creates the complete local font, glyph-image,
  manifest, and preview output.

## Site assets and screenshots

The website source now lives under `src/site/`. Notable files:

- `src/site/index.html`, `index.css`, and `offline.html`
- `src/site/pwa/manifest.webmanifest`
- `src/site/pwa/narrow/` and `src/site/pwa/wide/` screenshots used by the PWA
  manifest and README
- `src/site/smiley-source.json`, which chooses the emoji key used to generate
  the favicon, maskable icon, and social preview smiley from the pixel-font
  atlases

Changing `smiley-source.json` and rerunning `npm run svg:render` updates the
SVG source files and their checked-in PNG counterparts automatically.

## Unicode update examples

Update to a future released version with:

```bash
npm run unicode -- 18.0
```

Inspect the current draft without changing stable emoji data with:

```bash
npm run unicode:proposed
```

To require a particular draft version and provide display context for the demo:

```bash
npm run unicode:proposed -- 18.0 --stage=beta --expected=2026-09
```

The draft command writes `proposed/<version>.json` and records it under
`proposed` in `versions/manifest.json`. Draft entries have no release date and
remain separate from released version arrays.
