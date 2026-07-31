import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const markdown = await fs.readFile(
  path.join(root, "docs/newspeak-locale.md"),
  "utf8",
);

assert.match(
  markdown,
  /<!-- newspeak-word-inventory:start -->[\s\S]*<!-- newspeak-word-inventory:end -->/,
  "newspeak markdown must preserve generated word inventory markers",
);

assert.match(
  markdown,
  /<!-- newspeak-compound-inventory:start -->[\s\S]*<!-- newspeak-compound-inventory:end -->/,
  "newspeak markdown must preserve generated compound inventory markers",
);

assert.match(
  markdown,
  /\|\s*`\+X`\s*\|\s*more, stronger, larger, or preferred X\s*\|/,
  "newspeak markdown must document operator meanings",
);

assert.match(
  markdown,
  /Prefix modifiers apply only to the root immediately following them/,
  "newspeak markdown must document operator scope",
);

assert.match(
  markdown,
  /`make --image` survives as an approved UI label/,
  "newspeak markdown must document approved split labels",
);

assert.match(
  markdown,
  /- `--image time` = `--image` \+ `time`/,
  "newspeak samples must describe --image time as --image plus time",
);

const compoundSection = markdown.match(
  /<!-- newspeak-compound-inventory:start -->([\s\S]*?)<!-- newspeak-compound-inventory:end -->/,
);

assert.ok(
  compoundSection,
  "newspeak markdown must contain a generated compound inventory section",
);

const compoundText = compoundSection?.[1] ?? "";
assert.match(
  compoundText,
  /\| oldspeak\s+\| old \+ speak\s+\|/,
  "compound inventory must preserve oldspeak as the only fossil compound",
);

assert.ok(
  !compoundText.includes("| -ungo "),
  "compound inventory should not keep duplicate signed variants once a base form exists",
);

assert.ok(
  !compoundText.includes("| +ungo "),
  "compound inventory should collapse signed duplicates such as +ungo",
);

assert.ok(
  !compoundText.includes("--imagetime"),
  "compound inventory should not list non-un compounds like --imagetime in the reduced-compound model",
);
