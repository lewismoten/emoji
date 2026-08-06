import assert from "node:assert/strict";
import { createPixelFontRefreshOptions } from "../../../src/app/browser/browser-runtime.js";
import * as state from "../../../src/state.js";

const refreshStylesheetCalls: Array<{ revision: string; hasHandler: boolean }> =
  [];
const refreshExplorerCalls: Array<{
  revision: string;
  currentEmojiKey: string;
  applyArtwork: () => string;
  applyStandaloneArtwork: () => string;
}> = [];
let loadedCalls = 0;
let stylesheetRefreshed = false;

state.currentEmojiKey.set("rocket");

const refreshOptions = createPixelFontRefreshOptions(
  {
    applyPixelArtworkClass() {
      return "artwork";
    },
    applyStandalonePixelArtwork() {
      return "standalone";
    },
    dialog: () => ({ id: "dialog" }),
    onPixelFontRevisionLoaded() {
      loadedCalls += 1;
    },
    updateModifierArtwork() {
      return "modifier";
    },
    updatePixelArtworkManifest() {
      return "manifest";
    },
  },
  {
    refreshPixelFontStylesheet(
      styleOptions: { onStylesheetLoaded: (revision: string) => void },
      revision: string,
    ) {
      refreshStylesheetCalls.push({
        revision,
        hasHandler: typeof styleOptions.onStylesheetLoaded === "function",
      });
      styleOptions.onStylesheetLoaded(`${revision}-loaded`);
      stylesheetRefreshed = true;
      return Promise.resolve();
    },
    refreshExplorerPixelFont(runtimeOptions: any, revision: string) {
      refreshExplorerCalls.push({
        revision,
        currentEmojiKey: runtimeOptions.currentEmojiKey(),
        applyArtwork: runtimeOptions.applyArtwork,
        applyStandaloneArtwork: runtimeOptions.applyStandaloneArtwork,
      });
      return Promise.resolve();
    },
  },
);

assert.equal(await refreshOptions.refreshStylesheet("rev-a"), undefined);
assert.equal(stylesheetRefreshed, true);
assert.equal(loadedCalls, 1);
assert.deepEqual(refreshStylesheetCalls, [
  { revision: "rev-a", hasHandler: true },
]);
assert.equal(refreshExplorerCalls.length, 1);
assert.equal(refreshExplorerCalls[0].revision, "rev-a-loaded");
assert.equal(refreshExplorerCalls[0].currentEmojiKey, "rocket");
assert.equal(refreshExplorerCalls[0].applyArtwork(), "artwork");
assert.equal(refreshExplorerCalls[0].applyStandaloneArtwork(), "standalone");
