import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
const root = path.resolve(process.cwd());

const [localeRaw, uiRaw, markdown] = await Promise.all([
  fs.readFile(path.join(root, "src/data/locales/en-x-newspeak.json"), "utf8"),
  fs.readFile(
    path.join(root, "src/demo-locales/ui.en-x-newspeak.json"),
    "utf8",
  ),
  fs.readFile(path.join(root, "docs/newspeak-locale.md"), "utf8"),
]);

const locale = JSON.parse(localeRaw) as {
  labels: Record<string, string>;
};
const ui = JSON.parse(uiRaw) as Record<string, string>;

assert.equal(
  locale.labels.emoji,
  "--image",
  "generated locale labels must collapse emoji into --image",
);

assert.equal(
  ui.emojiVersion,
  "--image time",
  "generated UI strings must keep emoji version aligned with the reduced split-word model",
);

assert.equal(
  ui.emojiDetails,
  "--image know",
  "generated UI strings must use --image in emoji details wording",
);

assert.equal(
  ui.copyEmoji,
  "-take --image",
  "generated UI strings must use --image in copy actions",
);

assert.equal(
  ui.savedEmoji,
  "make --image",
  "generated UI strings must use --image in saved-emoji wording",
);

assert.equal(
  ui.favorites,
  "++good --image",
  "generated UI strings must use --image in favorites wording",
);

assert.equal(
  ui.systemRenderingSplit,
  "-good: machine divide sign. --image join sign.",
  "generated UI strings must keep the joined-sequence wording",
);

assert.match(
  markdown,
  /- `emoji` should generally collapse into `--image`/,
  "newspeak markdown must document emoji collapsing into --image",
);

assert.match(
  markdown,
  /- `--image time` = `--image` \+ `time`/,
  "newspeak markdown must keep operator-scope documentation in sync with generated output",
);

assert.ok(
  !markdown.includes("| -ungo "),
  "generated compound inventory must collapse duplicate signed variants such as -ungo",
);

assert.ok(
  !markdown.includes("| +ungo "),
  "generated compound inventory must collapse duplicate signed variants such as +ungo",
);

assert.match(
  markdown,
  /intentionally avoids introducing new fixed compounds beyond `un` forms and[\s\S]*`oldspeak`\./,
  "generated compound inventory must document the reduced compound model",
);

assert.match(
  markdown,
  /\| oldspeak\s+\| old \+ speak\s+\|/,
  "generated compound inventory must keep oldspeak as the one fossil compound",
);

assert.ok(
  !markdown.includes("--imagetime |"),
  "generated compound inventory must not promote non-un labels like --imagetime into fixed compounds",
);
