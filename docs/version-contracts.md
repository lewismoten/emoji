# Version contracts

Released Unicode data is protected by checked-in snapshot contracts so that
unexpected generator changes fail loudly.

## What is verified

The package tests verify:

- every key listed in each released `versions/*.json` file still exists
- every key still exports from `@lewismoten/emoji/all`
- every exported emoji still matches the released emoji dataset
- every key’s `codePoints` string still matches the checked-in contract
- the full released emoji catalog still matches the checked-in contract

This means tests fail if:

- a key name changes
- an emoji glyph sequence changes
- a code-point string changes
- a released emoji disappears from `all`

## Snapshot file

The contract lives in:

- [tests/package/version-exports.snapshot.json](../tests/package/version-exports.snapshot.json)

That snapshot stores counts and SHA-256 hashes for:

- the full released catalog
- every released Unicode Emoji version in `versions/manifest.json`

## Refreshing the snapshot intentionally

If a Unicode update intentionally changes names or sequences, refresh the
snapshot after regenerating the data:

```bash
npm run versions:snapshot
```

This command rebuilds the snapshot from:

- `src/emoji-source/codepoints.json`
- `src/emoji-source/catalog.json`
- `src/emoji-source/lookups.json`
- `versions/manifest.json`
- each released `versions/*.json` file

It will also throw if a version file references a key that does not exist in
the released emoji dataset.

## Typical workflow

For a new released Unicode version:

```bash
npm run unicode -- 18.0
npm run versions:snapshot
npm test
```

For a generator refactor that should not change released data:

```bash
npm test
```

If tests fail on the version contract unexpectedly, that usually means a key,
emoji sequence, or code-point string drifted and should be reviewed before the
snapshot is updated.

## Test layout

The released-version contract tests are split across:

- [tests/package/version-exports-legacy.test.mts](../tests/package/version-exports-legacy.test.mts)
- [tests/package/version-exports-modern-a.test.mts](../tests/package/version-exports-modern-a.test.mts)
- [tests/package/version-exports-modern-b.test.mts](../tests/package/version-exports-modern-b.test.mts)

They are split only to keep runtime under the repository’s per-file timing
budget while still verifying every released emoji.
