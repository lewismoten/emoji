import assert from "node:assert/strict";

import {
  createVersionConfig,
  createVersionRuntime,
} from "../../src/app/version/version-runtime.js";
import { loadExplorerCatalog } from "../../src/explorer/catalog-loader.js";
import { loadVersionCatalog } from "../../src/explorer/filters/version-data.js";

const state = {
  allIds: ["wave"],
  byId: { wave: { key: "wave" } },
  emojiByKey: { wave: "👋" },
  items: [{ key: "wave" }],
};

const clickCalls: unknown[][] = [];
const dialogViewCalls: unknown[][] = [];

const options = {
  applyLoadedUrlState: () => "apply-loaded-url-state",
  buildRepresentatives: () => "build-representatives",
  developerModeEnabled: () => false,
  drawList: () => "draw-list",
  getEmojiGenders: (item: unknown) => ["emoji-genders", item],
  getExplorerSubGroup: () => "hands",
  getIntroducedVersion: (key: string) => `introduced:${key}`,
  groupSelector: () => "group-selector",
  genderCheckboxes: () => ["neutral"],
  genderFieldset: () => "gender-fieldset",
  hairCheckboxes: () => ["red"],
  hairFieldset: () => "hair-fieldset",
  isViteDevelopment: true,
  modifierFilters: () => "modifier-filters",
  onClick: (...args: unknown[]) => {
    clickCalls.push(args);
  },
  onGroupChange: () => "on-group-change",
  onSequenceTypeChange: () => "on-sequence-type-change",
  onSubGroupChange: () => "on-subgroup-change",
  rebuildCodePointLookup: () => "rebuild-codepoint-lookup",
  renderCategoryFilters: () => "render-category-filters",
  sequenceTypeSelector: () => "sequence-type-selector",
  setDialogView: (...args: unknown[]) => {
    dialogViewCalls.push(args);
  },
  skinToneCheckboxes: () => ["1F3FB"],
  skinToneFieldset: () => "skin-tone-fieldset",
  state: () => state,
  subGroupSelector: () => "subgroup-selector",
  translate: (key: string, fallback: string) => `${key}:${fallback}`,
  updateModifierArtwork: () => "update-modifier-artwork",
  updatePixelArtworkManifest: () => "update-pixel-artwork-manifest",
  versionModeSelector: () => ({ value: "selected" }),
  versionNext: () => "version-next",
  versionPrevious: () => "version-previous",
  versionRange: () => "version-range",
  versionRangeValue: () => "version-range-value",
  versionSelector: () => "version-selector",
};

const config = createVersionConfig(options);

assert.equal(config.applyLoadedUrlState(), "apply-loaded-url-state");
assert.equal(config.buildRepresentatives(), "build-representatives");
assert.equal(config.developerModeEnabled(), false);
assert.equal(config.drawList(), "draw-list");
assert.deepEqual(config.getEmojiGenders("wave"), ["emoji-genders", "wave"]);
assert.equal(config.getIntroducedVersion("wave"), "introduced:wave");
assert.equal(config.groupSelector(), "group-selector");
assert.deepEqual(config.genderCheckboxes(), ["neutral"]);
assert.equal(config.genderFieldset(), "gender-fieldset");
assert.deepEqual(config.hairCheckboxes(), ["red"]);
assert.equal(config.hairFieldset(), "hair-fieldset");
assert.equal(config.modifierFilters(), "modifier-filters");
assert.equal(config.onGroupChange(), "on-group-change");
assert.equal(config.onSequenceTypeChange(), "on-sequence-type-change");
assert.equal(config.onSubGroupChange(), "on-subgroup-change");
assert.equal(config.rebuildCodePointLookup(), "rebuild-codepoint-lookup");
assert.equal(config.renderCategoryFilters(), "render-category-filters");
assert.equal(config.sequenceTypeSelector(), "sequence-type-selector");
assert.deepEqual(config.skinToneCheckboxes(), ["1F3FB"]);
assert.equal(config.skinToneFieldset(), "skin-tone-fieldset");
assert.equal(config.state(), state);
assert.equal(config.subGroupSelector(), "subgroup-selector");
assert.equal(config.translate("released", "released"), "released:released");
assert.equal(config.updateModifierArtwork(), "update-modifier-artwork");
assert.equal(config.versionModeSelector().value, "selected");
assert.equal(config.versionNext(), "version-next");
assert.equal(config.versionPrevious(), "version-previous");
assert.equal(config.versionRange(), "version-range");
assert.equal(config.versionRangeValue(), "version-range-value");
assert.equal(config.versionSelector(), "version-selector");

assert.equal(typeof config.loadCatalog, "function");
assert.equal(typeof config.loadVersionCatalog, "function");
const originalCatalogDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    querySelector() {
      return null;
    },
  },
});
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    location: { href: "https://example.test/" },
  },
});
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: async (input: string) => {
    if (
      input === "versions/manifest.json" ||
      input === "src/data/versions/manifest.json"
    ) {
      return {
        ok: true,
        async json() {
          return { proposed: [], versions: [] };
        },
      };
    }
    if (input === "explorer/catalog.json") {
      return {
        ok: true,
        async json() {
          return {
            fields: ["key", "emoji", "group", "subGroup"],
            emoji: [["wave", "👋", "People & Body", "hand-fingers-open"]],
          };
        },
      };
    }
    if (/^pixel-font\/build\/explorer-manifest\.json/.test(input)) {
      return {
        ok: true,
        async json() {
          return { glyphs: [] };
        },
      };
    }
    throw new Error(`Unexpected fetch: ${input}`);
  },
});
try {
  assert.deepEqual(
    await config.loadCatalog(),
    await loadExplorerCatalog({
      getExplorerSubGroup: options.getExplorerSubGroup,
      isViteDevelopment: options.isViteDevelopment,
      updatePixelArtworkManifest: options.updatePixelArtworkManifest,
    }),
  );
  assert.deepEqual(
    await config.loadVersionCatalog(),
    await loadVersionCatalog({
      allIds: () => state.allIds,
      byId: () => state.byId,
      emojiByKey: () => state.emojiByKey,
      getExplorerSubGroup: options.getExplorerSubGroup,
      items: () => state.items,
    }),
  );
} finally {
  if (originalCatalogDocument) {
    Object.defineProperty(globalThis, "document", originalCatalogDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalFetch) {
    Object.defineProperty(globalThis, "fetch", originalFetch);
  } else {
    Reflect.deleteProperty(globalThis, "fetch");
  }
}

config.openEmoji("wave", true, undefined, "code");
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, true]);
assert.deepEqual(dialogViewCalls.at(-1), ["code", false]);

config.openEmoji("wave", false, undefined, "editor");
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, false]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

config.openEmoji("wave", true, undefined, "details");
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, true]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

config.openEmoji("wave", true, undefined, undefined);
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, true]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    getElementsByClassName() {
      return [{ innerText: "" }];
    },
  },
});

try {
  const target = { innerText: "" };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementsByClassName(name: string) {
        assert.equal(name, "emoji-version");
        return [target];
      },
    },
  });
  config.setIntroducedVersion("Emoji 16.0");
  assert.equal(target.innerText, "Emoji 16.0");

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementsByClassName() {
        return [];
      },
    },
  });
  config.setIntroducedVersion("Emoji 17.0");
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}

assert.doesNotThrow(() => createVersionRuntime(options));
