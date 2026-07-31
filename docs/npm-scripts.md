# npm scripts

This repository’s `package.json` scripts are listed here in one place.

## Baseline requirements

Most scripts only require:

- Node.js 22 or newer
- npm
- `npm install`

The project currently declares `node >=22.0.0` in
[package.json](../package.json).

## Extra requirements by script family

Some scripts need more than a plain Node install.

### Pixel font build scripts

These scripts compile fonts or validate atlas artwork:

- `pixel-font:build`
- `pixel-font:build:optimized`
- `pixel-font:package`
- `pixel-font:text`
- `pixel-font:validate`
- `website:build`
- `website:publish`

Additional requirements:

- Python 3
- a virtual environment at `pixel-font/.venv` is recommended
- packages from `pixel-font/requirements.txt`

Set that up once with:

```bash
python3 -m venv pixel-font/.venv
pixel-font/.venv/bin/pip install -r pixel-font/requirements.txt
```

Without the Python dependencies, some font outputs such as WOFF2 may be
skipped.

### Website publishing

`website:publish` also needs:

- SSH access to the target host
- an SSH key or other working SSH authentication
- `rsync` for the preferred transport, or SSH plus `tar` for the fallback

### Unicode and CLDR download scripts

These scripts fetch upstream data:

- `unicode`
- `unicode:proposed`
- `cldr`

Additional requirements:

- internet access

### Shell-dependent cleanup

`clean` uses `rm -rf`, so it expects a Unix-like shell environment such as
macOS Terminal, Linux, Git Bash, or WSL.

## Script reference

| Script                                                       | What it does                                                                                                                                                       | Extra requirements                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `npm run clean`                                              | Removes generated `build/` and `dist/` output.                                                                                                                     | Bash or another Unix-like shell for `rm -rf`.                                          |
| `npm run generate`                                           | Regenerates package data and Explorer CSS from source data.                                                                                                        | None beyond baseline requirements.                                                     |
| `npm run build`                                              | Runs `clean`, `generate`, and both TypeScript compilers.                                                                                                           | None beyond baseline requirements.                                                     |
| `npm run bundle`                                             | Produces the publishable package output, browser bundle, rollup builds, declarations, and refreshed SVG/PNG assets.                                                | None beyond baseline requirements.                                                     |
| `npm run prepublishOnly`                                     | Automatically runs `bundle` before `npm publish`.                                                                                                                  | None beyond whatever `bundle` needs.                                                   |
| `npm start`                                                  | Starts the Vite development server for Emoji Explorer.                                                                                                             | None beyond baseline requirements.                                                     |
| `npm test`                                                   | Builds the test bundle, generates demo pages and service worker output, runs Node tests, checks package exports with TypeScript, and validates pixel-font atlases. | Python 3 plus `pixel-font/requirements.txt` because `pixel-font:validate` runs.        |
| `npm run test:node`                                          | Generates demo pages and service worker output, then runs the Node test suite.                                                                                     | None beyond baseline requirements.                                                     |
| `npm run format`                                             | Formats supported repository files with Prettier.                                                                                                                  | None beyond baseline requirements.                                                     |
| `npm run format:check`                                       | Checks formatting with Prettier without rewriting files.                                                                                                           | None beyond baseline requirements.                                                     |
| `npm run demo:locales`                                       | Generates static localized demo pages into `build/demo-pages`.                                                                                                     | None beyond baseline requirements.                                                     |
| `npm run demo:pwa`                                           | Generates the service worker file.                                                                                                                                 | None beyond baseline requirements.                                                     |
| `npm run demo:validate`                                      | Validates the generated pages-site output.                                                                                                                         | None beyond baseline requirements.                                                     |
| `npm run svg:render`                                         | Synchronizes the configured smiley from pixel-art source into SVG assets and rerenders tracked PNG assets such as the social preview.                              | None beyond baseline requirements.                                                     |
| `npm run website:build`                                      | Builds a complete website bundle for `emoji.lewismoten.com` under `build/website`.                                                                                 | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run website:publish -- --target user@example.com:/path` | Builds and uploads the website bundle to a remote host.                                                                                                            | Python 3, `pixel-font/requirements.txt`, SSH, and `rsync` or `tar` on the remote path. |
| `npm run pixel-font:generate`                                | Regenerates atlas assignment metadata without building compiled font output.                                                                                       | None beyond baseline requirements.                                                     |
| `npm run pixel-font:build`                                   | Builds the full pixel font output, manifests, previews, and glyph assets.                                                                                          | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run pixel-font:build:optimized`                         | Builds the pixel font with the slower optimization pass enabled.                                                                                                   | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run pixel-font:package`                                 | Produces the optimized fonts-only build and packages the standalone pixel font release artifacts.                                                                  | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run pixel-font:text`                                    | Builds the retro Latin UI font used by retro mode.                                                                                                                 | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run pixel-font:version -- patch`                        | Bumps the independent pixel-font version.                                                                                                                          | None beyond baseline requirements.                                                     |
| `npm run pixel-font:validate`                                | Verifies atlas mappings and pixel-font source consistency.                                                                                                         | Python 3 plus `pixel-font/requirements.txt`.                                           |
| `npm run unicode -- 18.0`                                    | Downloads a released Unicode Emoji version and regenerates library data.                                                                                           | Internet access.                                                                       |
| `npm run unicode:proposed`                                   | Downloads the current official Unicode draft data.                                                                                                                 | Internet access.                                                                       |
| `npm run versions:snapshot`                                  | Refreshes the released Unicode version contract snapshot used by tests.                                                                                            | None beyond baseline requirements.                                                     |
| `npm run cldr`                                               | Downloads CLDR annotations, regenerates locale packs, and formats the results.                                                                                     | Internet access.                                                                       |
| `npm run locales:overrides`                                  | Applies repository-managed locale label overrides, then formats the results.                                                                                       | None beyond baseline requirements.                                                     |
| `npm run locales:newspeak`                                   | Regenerates the custom Newspeak locale data.                                                                                                                       | None beyond baseline requirements.                                                     |

## Common workflows

### 1. First local run

If you only want to run Emoji Explorer with the committed generated assets:

```bash
npm install
npm start
```

This is enough for normal browsing and UI work because the repository already
contains the generated locale files, generated site pages, and current font
assets needed by the Vite app.

### 2. Full local rebuild after data or source changes

Run this when you have changed package data, TypeScript, generated CSS, or any
library-facing source that should be reflected in `dist/`:

```bash
npm install
npm run bundle
npm start
```

`bundle` already runs:

- `build`
- `svg:render`
- browser bundle generation
- Rollup packaging
- declaration generation

You do not need to run `generate` separately unless you are debugging that step
by itself.

### 3. Rebuild pixel emoji after atlas or font-source edits

Run this when you changed files under `pixel-font/atlases/`, the atlas
manifests, or the pixel-font build scripts:

```bash
npm run pixel-font:validate
npm run pixel-font:build
npm start
```

Use this optimized variant only when you want the slower production-style font
optimization pass:

```bash
npm run pixel-font:build:optimized
```

### 4. Rebuild the retro text font

Run this when you changed the retro text bitmap sources, related PNG sheets, or
the retro text generator:

```bash
npm run pixel-font:text
```

You only need this step when the retro text font itself changed.

### 5. Refresh icons, social preview, and favicon artwork

Run this when you changed:

- `src/site/smiley-source.json`
- `src/site/favicon.svg`
- maskable icon SVG assets
- the pixel-art glyph used as the site smiley

```bash
npm run svg:render
```

This updates the repository-tracked SVG and PNG preview assets. It does not
replace `bundle`, but `bundle` already includes it.

### 6. Regenerate Newspeak locale data

Run this when you changed the Newspeak generator or want refreshed
`en-x-newspeak` locale output:

```bash
npm run locales:newspeak
```

You do not need to run this before `npm start` unless you changed the Newspeak
source or generator and want those updates reflected locally.

### 7. Refresh CLDR locale packs

Run this when you want to pull updated upstream CLDR annotations:

```bash
npm run cldr
```

This requires internet access and rewrites locale JSON output.

### 8. Import a released Unicode update

Run this when adding a new released Unicode Emoji version:

```bash
npm run unicode -- 18.0
npm run bundle
npm test
```

If the release intentionally changes version contracts, follow with:

```bash
npm run versions:snapshot
```

### 9. Import the current Unicode draft

Run this when updating proposed emoji data:

```bash
npm run unicode:proposed
npm run bundle
npm test
```

If you need to pin the expected draft version and stage metadata:

```bash
npm run unicode:proposed -- 18.0 --stage=beta --expected=2026-09
```

### 10. Prepare a production website build

For a fresh local website bundle:

```bash
npm install
python3 -m venv pixel-font/.venv
pixel-font/.venv/bin/pip install -r pixel-font/requirements.txt
npm run website:build
```

This performs the package build, fonts-only pixel font build, static page
generation, service-worker generation, and site validation in the correct
order.

### 11. Publish the website

After `website:build` succeeds, publish with:

```bash
npm run website:publish -- \
  --identity ~/.ssh/id_rsa \
  --target user@example.com:/var/www/emoji/
```

If the remote host does not support `rsync`, either let the script fall back to
`tar` automatically or force it:

```bash
npm run website:publish -- \
  --identity ~/.ssh/id_rsa \
  --transport tar \
  --target user@example.com:/var/www/emoji/
```

### 12. Package the standalone pixel font release

Run this when publishing the separate pixel font package or release assets:

```bash
npm run pixel-font:package
```

That script already runs the optimized fonts-only build before packaging the
release output.

## Related guides

- [Development guide](development-guide.md)
- [Package usage](package-usage.md)
- [Version contracts](version-contracts.md)
- [Pixel Emoji build and editor workflow](../pixel-font/BUILD_AND_EDITOR.md)
