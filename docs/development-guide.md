# Development guide

## Running Emoji Explorer locally

After the first successful visit, the Explorer and its core Unicode data work
offline. Search-language packs are cached after they are selected once.

Run the demo locally with Vite:

```bash
npm install
npm start
```

Then open <http://localhost:5173/>. Localized routes such as
<http://localhost:5173/index.ar.html> are generated in memory by Vite.

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

- `npm run clean` removes generated `build` and `dist` directories.
- `npm run generate` creates popular, complete, category, subgroup, and
  variation source packs from `emoji.json` and `popular.json`.
- `npm run build` regenerates the library and compiles TypeScript.
- `npm run bundle` produces the publishable JavaScript and TypeScript files.
- `npm test` builds the package and verifies Unicode releases, public package
  specifiers, TypeScript declarations, localized demo pages, and PWA assets.
- `npm start` runs the local Emoji Explorer.
- `npm run website:build` creates and validates `build/website` for
  `emoji.lewismoten.com`.
- `npm run website:publish -- --target <destination>` builds and uploads the
  site over `rsync`.
- `npm run format` formats repository JSON files with Prettier.
- `npm run cldr -- <locale>` downloads CLDR annotations and regenerates locale
  packs. A regional locale automatically generates its base language first.
- `npm run unicode -- <version>` downloads a released Unicode Emoji version and
  regenerates the library data.
- `npm run unicode:proposed` downloads the current official Unicode draft data.
- `npm run versions:snapshot` refreshes the released version contract snapshot.
- `npm run pixel-font:generate` updates pixel-font atlas assignments without
  creating empty PNG sheets.
- `npm run pixel-font:validate` verifies every active atlas assignment.
- `npm run pixel-font:build` creates the complete local font, glyph-image,
  manifest, and preview output.
- `npm run pixel-font:build -- --fonts-only` creates the deployment font files
  and manifests without individual PNG or SVG glyph output.
- `npm run pixel-font:package` creates the fonts-only build, standalone npm
  package, and versioned GitHub Release assets.
- `npm run pixel-font:version -- patch` bumps the independent font version
  without changing the JavaScript package version.

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
