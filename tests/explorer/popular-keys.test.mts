import assert from "node:assert/strict";
import { popularKeys } from "../../src/explorer/popular-keys.js";

assert.equal(Array.isArray(popularKeys), true);
assert.equal(popularKeys.length, 100);
assert.equal(popularKeys[0], "faceWithTearsOfJoy");
assert.equal(popularKeys[1], "redHeart");
assert.equal(popularKeys.at(-1), "perseveringFace");
assert.equal(new Set(popularKeys).size, popularKeys.length);
assert.equal(popularKeys.includes("thumbsUp"), true);
assert.equal(popularKeys.includes("glowingStar"), true);
