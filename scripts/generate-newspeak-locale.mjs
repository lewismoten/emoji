import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeFile = (file, value) =>
  fs.writeFileSync(path.join(root, file), `${value}\n`);

const englishLocale = readJson("src/data/locales/en.json");
const englishUi = readJson("src/demo-locales/ui.en.json");

const tokenBuckets = Object.fromEntries(
  Object.entries({
    "++good":
      "grinning laugh joy laughing love loving kiss party celebration sparkles star-struck adore excellent perfect best delight",
    "+good":
      "smile smiling happy grin good ok okay yes like liked up thumbs cool fun bright sunny success win winning gift present hug friend friends welcome nice",
    "--good":
      "skull death dead poo pile collision explosion rage scream vomit broken prohibited forbidden danger doom",
    "-good":
      "sad cry crying angry frown frowning hurt pain sick ill cold fear worried worry down bad no stop warning caution mad fail",
    face: "face faces smiley smileys emotion emotions cat monkey",
    body: "body bodies hair skin eye eyes ear ears mouth nose leg legs arm arms foot feet bone bones tooth teeth lung lungs brain lip lips tongue",
    "-body":
      "hand hands finger fingers thumb thumbs clap fist wave waving gesture gestures handshape",
    other:
      "person people adult adults man men woman women boy boys girl girls baby babies child children family families couple couples bride groom parent parents",
    beast:
      "animal animals bird birds dog dogs cat cats monkey monkeys fish fishes whale turtle bear lion tiger cow pig horse rabbit bunny frog bug bugs insect insects mammal mammals marine reptile reptiles amphibian amphibians",
    "++plant": "tree trees forest wood woods palm evergreen deciduous leafless",
    "--plant":
      "mushroom mushrooms seedling seedlings herb herbs sprout sprouts shamrock clover",
    plant:
      "plant plants flower flowers leaf leaves cactus grass fruit bouquet rosette blossom floral",
    take: "food foods eat eating meal meals bread rice meat cake cakes sweet sweets fruit vegetable vegetables burger pizza egg eggs salad asian prepared cook cooking",
    drink:
      "drink drinks beer wine coffee tea milk juice cup bottle bottles straw cocktail champagne glass glasses beverage",
    go: "move moving travel travels car cars bus buses truck trucks plane airplane aeroplane train trains ship boat boats rocket bike bicycle bicycles tram tramway vehicle vehicles transport",
    "-go":
      "link links url urls chain chains connect connected connection path paths route routes jump jumps load loads loading",
    "-take": "copy copies copied copying clipboard",
    "-code":
      "code codes sample samples example examples script scripts syntax escape escaped",
    "--code": "codepoint codepoints",
    reveal:
      "find finds finding found search searches searching searched discover discovers discovering discovered explore explores exploring explored",
    "+reveal": "filter filters filtered filtering refine refined refining",
    "set think":
      "choose chooses choosing chosen menu menus select selects selecting selection pick picks picked option options",
    obey: "order orders ordering ordered sort sorted sorting arrange arranged arranging",
    receive:
      "install installed installing installation get gets getting download downloads downloading obtain obtains obtaining",
    exit: "escape escapes leave leaves close closes quit quits cancel cancels end ends out outside",
    "-exit": "fallback fallbacks backup backups",
    place:
      "place places building buildings city hotel map mountain mountains beach park parks church castle office school hospital",
    "-place":
      "local locale localized location nearby near native regional area",
    "--place": "home homes house houses",
    "++above":
      "sun moon star stars cloud clouds rain snow weather sky storm lightning rainbow",
    time: "time clock clocks watch watches calendar date dates hour hours minute minutes day days month months year years version",
    "+light": "fire flame hot burn burning",
    water: "water wave waves ocean river sea drop drops",
    sign: "sign signs symbol symbols button buttons arrow arrows keycap letter letters",
    value:
      "number numbers quantity quantities count counts total totals amount amounts result results value values",
    image: "image images icon icons picture pictures graphic graphics",
    "-mark": "tag tags mark marks tagged marking",
    flag: "flag flags country countries nation nations subdivision regional",
    "--body":
      "heart hearts organ organs chest pulse pulses cardiac anatomy anatomic anatomical",
    undeny:
      "refuse refuses refused refusing block blocks blocked blocking denied",
    divide:
      "split splits splitting separated separate separation parts components component",
    unshow: "hidden hide hides hiding private conceal concealed secret",
    sound:
      "music musical song songs instrument instruments note notes sound sounds",
    "ungood out":
      "sport sports game games ball balls medal medals award awards play playing",
    work: "work working tool tools science medical doctor nurse judge police teacher student office lab computer computers phone phones",
    thing:
      "object objects box boxes package packages book books paper papers money gem gems gift gifts clothes clothing hat hats shoe shoes accessory accessories mail",
  }).map(([key, value]) => [key, new Set(value.split(" "))]),
);

const phraseOverrides = new Map([
  ["emoji explorer", "--image Reveal"],
  ["language not loaded", "word speak ungood"],
  ["no language pack", "oldspeak only"],
  ["advanced filters", "++reveal"],
  ["version filter", "time +reveal"],
  ["emoji version", "--image time"],
  ["skin tone", "body mark"],
  ["original pixel font", "old --image words"],
  ["localized search", "-place word speak"],
  ["choose a search language", "decide word speak"],
  ["search and explore unicode emoji", "reveal and know --image"],
  ["help and settings", "help & set"],
  ["developer mode", "++think mode"],
  ["loading emoji explorer…", "-go --image reveal…"],
  ["loading emoji…", "-go --image…"],
  ["pixel editor", "make --image"],
  ["code example", "-code"],
  ["saved emoji", "made --image"],
  ["favorites", "++good --image"],
  ["recently copied", "new -take"],
]);

const uiOverrides = {
  title: "--image Reveal",
  matches: "show",
  searchPlaceholder: "reveal --image. say drink or body.",
  language: "word speak",
  languageNotLoaded: "word speak ungood",
  noLanguagePack: "oldspeak only",
  filtersLong: "+reveal by kind, time, body mark.",
  filters: "+reveal",
  advancedFilters: "++reveal",
  group: "kind",
  subgroup: "-kind",
  chooseGroup: "set think kind",
  chooseSubgroup: "set think -kind",
  versionFilter: "time +reveal",
  emojiVersion: "--image time",
  skinTone: "body mark",
  loadingExplorer: "-go --image reveal…",
  originalPixelFont: "unnew --image word",
  pixelHeroTitle: "know sign in unnew machine 12×12",
  pixelHeroDescription:
    "show sign. know sign. -take sign. then see same machine sign to --image sign.",
  system: "machine",
  pixel: "--image",
  pixelFontOn: "--image word: +good",
  pixelFontOff: "--image word: -good",
  emojiStyle: "--image seek",
  pixelHelpTitle: "--image sign in sign show",
  pixelHelpDescription:
    "--image word +good use unnew 12×12 sign when --image there. --image word -good obey machine first. --image sign still -ungo for -good new sign.",
  pixelHelpLink: "know and get Pixel Emoji",
  browse: "seek",
  groups: "kind",
  popular: "++good",
  unicode: "--word",
  sequences: "make sign",
  localizedSearch: "-place word speak",
  chooseLanguage: "set think word speak",
  chooseLanguageDescription: "set think word speak for sign reveal.",
  theme: "+seek",
  themeDescription: "command light, unlight, or unnew.",
  audio: "music",
  audioDescription: "unmusic and music live in light, unlight, and unnew.",
  soundEffects: "unmusic",
  music: "music",
  mode: "command",
  modeDescription: "command obey, think, or reveal.",
  standard: "obey",
  advanced: "think",
  developer: "reveal",
  light: "light",
  dark: "unlight",
  base: "plain",
  retro: "unnew",
  expected: "await",
  keywords: "+word",
  emojiDetails: "--image know",
  released: "now",
  englishName: "name",
  introduced: "first out",
  codePoints: "value",
  sequenceType: "make kind",
  builtFrom: "make from",
  systemRenderingSplit: "-good: machine divide sign. --image join sign.",
  systemRenderingComposed: "+good: machine show same sign.",
  pixelDesignMissing: "this --image unknow. --ungood.",
  createPixelDesign: "make 12×12 --image",
  result: "value",
  zeroWidthJoiner: "unword join",
  emojiPresentation: "--image show",
  textPresentation: "word show",
  combiningKeycap: "-key",
  tagCharacter: "-mark sign",
  cancelTag: "unmark",
  cancelTagAbbreviation: "ungo",
  regionalIndicator: "flag sign",
  copyEmoji: "-take --image",
  viewCode: "see code",
  codeExample: "-code",
  backToEmoji: "back to --image",
  savedEmoji: "make --image",
  favorites: "++good --image",
  recentlyCopied: "new -take",
  noFavorites: "++good --image wait now.",
  noRecentlyCopied: "new -take wait now.",
  addFavorite: "++good --image",
  removeFavorite: "--good --image",
  keyboardShortcuts: "-key",
  helpAndSettings: "help & set",
  settings: "set",
  developerMode: "++think mode",
  developerModeDescription:
    "show make sign, machine sign, -code tool, machine divide, and make --image. --good if unshow.",
  shortcutClose: "ungo speak box or unmark reveal",
  loadingEmoji: "-go --image…",
  loadingVersions: "-go time…",
  loadingLanguage: "-go word speak…",
  offlineStatus: "unnet. make data only.",
  installApp: "receive Sign Reveal app",
  installInstructionsTitle: "receive Sign Reveal app",
  installInstructionsIos: "open share. set think --place. then add. +good.",
  installInstructionsBrowser:
    "use machine receive command. bar or set think. obey.",
  aboutTitle: "reveal and know --image",
  aboutDescription:
    "seek ++good --image by word, kind, time, body mark, and make kind.",
  pixelFontCredit:
    "sign use --Image, unnew 12×12 -ungo by Lewis Moten. unnew good.",
  noResults: "unshow --image",
  noResultsDescription: "unmark word or +reveal. again.",
  clearSearch: "unmark reveal",
  resetFilters: "unmark +reveal",
  previousVersion: "back time",
  nextVersion: "next time",
  previousEmoji: "back --image",
  nextEmoji: "next --image",
  filterEmoji: "+reveal --image",
  searchEmoji: "reveal --image",
  skipToResults: "go --image list",
  emojiResults: "--image list",
  emojiBrowseOrder: "--image seek obey",
  chooseBrowseOrder: "set think --image seek obey",
  emojiCopied: "--image -take +good.",
  keyCopied: "key -take +good.",
  escapeCopied: "+ungo -take +good.",
  copyKey: "-take key",
  keyShort: "-key",
  copyEscape: "+ungo",
  escapeShort: "+ungo",
  copyCodePoints: "--code",
  codePointsCopied: "--code -take +good.",
  copyCode: "-code",
  codeShort: "-code",
  codeCopied: "-code -take +good.",
  copyLink: "-go",
  linkShort: "-go",
  linkCopied: "-go -take +good.",
  copiedToClipboard: "-take +good.",
  copyFailed: "-take -good.",
  close: "ungo",
  pixelEmoji: "--image",
  editPixelArt: "make --image",
  pixelEditor: "make --image",
  drawingTools: "make tools",
  pencil: "-mark",
  line: "mark",
  rectangle: "box",
  ellipse: "unbox",
  paintBucket: "++mark",
  eyedropper: "see",
  selectRegion: "divide",
  undo: "ungo",
  redo: "go",
  pixelCanvas: "12 by 12 sign place",
  drawingColor: "light",
  egaPalette: "light",
  transparentEraser: "see",
  tracing: "take",
  traceOpacity: "see",
  artworkTransfer: "image go",
  artWorkTransfer: "image go",
  copyPixelArt: "-take image",
  copyFontGlyph: "-take word",
  pasteAsLayer: "-untake image",
  floatingLayer: "overimage",
  moveLayer: "go overimage",
  rotateLayerLeft: "unstill overimage left 45",
  rotateLayerRight: "unstill overimage right 45",
  flipLayerHorizontal: "-same overimage side",
  flipLayerVertical: "-same overimage updown",
  invertLayer: "unsame",
  bakeLayer: "join",
  cancelLayer: "unuse",
  unsavedArtwork: "unthing",
  row: "list",
  column: "unlist",
};

const localeLabelOverrides = {
  emoji: "--image",
};

const tokenize = (text) =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9+\-]+/g) ?? [];

const ignoredWordInventoryTokens = new Set([
  "en",
  "en-x-newspeak",
  "english",
  "newspeak",
  "num",
  "lewis",
  "moten",
]);

const canonicalWordInventoryMap = new Map([
  ["divides", "divide"],
  ["kinds", "kind"],
  ["shows", "show"],
  ["tools", "tool"],
  ["words", "word"],
  ["times", "time"],
  ["uses", "use"],
  ["revealed", "reveal"],
  ["waits", "wait"],
  ["made", "make"],
  ["has", "have"],
  ["is", "be"],
  ["are", "be"],
  ["first", "one"],
  ["gets", "get"],
  ["says", "say"],
  ["makes", "make"],
  ["takes", "take"],
  ["receive", "get"],
  ["revealed", "show"],
  ["reveal", "show"],
  ["speak", "say"],
  ["compare", "see-same"],
  ["custom", "other-set"],
  ["dialog", "speak-box"],
  ["add", "make"],
  ["denied", "undeny"],
  ["dark", "unlight"],
  ["number", "value"],
  ["off", "unon"],
  ["old", "unnew"],
  ["exit", "ungo"],
  ["clear", "unmark"],
  ["await", "wait"],
  ["relief", "ungood-out"],
  ["pixel", "--image"],
  ["emoji", "--image"],
]);

const knownWordParts = [
  "image",
  "light",
  "dark",
  "plain",
  "speak",
  "clear",
  "reveal",
  "sign",
  "goodest",
  "kind",
  "time",
  "body",
  "word",
  "seek",
  "good",
  "think",
  "copy",
  "back",
  "next",
  "list",
  "made",
  "from",
  "code",
  "exit",
  "take",
  "new",
  "old",
  "all",
  "key",
  "tag",
  "show",
  "join",
  "sub",
  "off",
  "net",
  "tool",
  "mode",
  "help",
  "set",
  "machine",
  "make",
  "color",
  "place",
  "decide",
  "obey",
  "other",
  "relief",
  "above",
  "mark",
  "receive",
  "denied",
  "secret",
  "go",
];

function splitCompoundWord(word) {
  let unsigned = /^[-+]*(.+?)[-+]*$/.exec(word)?.[1];
  if (ignoredWordInventoryTokens.has(unsigned) || /^\d/.test(unsigned))
    return [];
  if (unsigned.startsWith("un") && unsigned.length > 2) {
    const tail = unsigned.slice(2);
    const tailParts = splitCompoundWord(tail);
    if (tailParts.length) return ["un", ...tailParts];
  }
  if (unsigned.includes("-")) {
    return unsigned
      .split("-")
      .flatMap((part) => splitCompoundWord(part))
      .filter(Boolean);
  }

  const lowered = unsigned.toLowerCase();
  const segments = [];
  let cursor = 0;

  while (cursor < lowered.length) {
    const part = knownWordParts.find((candidate) =>
      lowered.startsWith(candidate, cursor),
    );
    if (!part) return [unsigned];
    segments.push(part);
    cursor += part.length;
  }

  return segments.length > 1 ? segments : [unsigned];
}

function normalizeInventoryWord(word) {
  return canonicalWordInventoryMap.get(word) ?? word;
}

function normalizeCompoundPart(word) {
  if (word === "speak") return "speak";
  return normalizeInventoryWord(word);
}

function addRootInventoryPart(rootWords, part) {
  if (!part || part === "un") return;
  const nestedParts = splitCompoundWord(part).map(normalizeCompoundPart);
  if (nestedParts.length > 1) {
    nestedParts.forEach((nestedPart) =>
      addRootInventoryPart(rootWords, nestedPart),
    );
    return;
  }
  rootWords.add(part);
}

function mapToken(token) {
  if (token === "not" || token === "non") return "-good";
  for (const [label, values] of Object.entries(tokenBuckets)) {
    if (values.has(token)) return label;
  }
  return /^\d+$/.test(token) ? "num" : "";
}

const reduceWords = (text, fallback = "thing") => {
  const reduced = [...new Set(tokenize(text).map(mapToken).filter(Boolean))];
  return reduced.length ? reduced : [fallback];
};

const phraseFromWords = (words, fallback = "thing") => {
  const mood = words.find((word) => word.includes("good"));
  const kind = words.find((word) => !word.includes("good") && word !== "num");
  return [mood, kind].filter(Boolean).slice(0, 2).join(" ") || fallback;
};

function annotationFor(key, values) {
  const words = reduceWords([key, ...(values ?? [])].join(" "));
  const lowered = key.toLowerCase();
  if (lowered === "fireextinguisher") return ["+light", "thing"];
  if (lowered === "fireengine") return ["+light", "go"];
  if (lowered === "firecracker") return ["+light", "above"];
  if (lowered.startsWith("firefighter")) return ["+light", "body"];
  if (lowered === "plus") return ["+sign", "sign"];
  if (lowered.includes("flag")) return ["flag"];
  const name = lowered.includes("heart")
    ? phraseFromWords([...words, "--body"], "--body")
    : lowered.includes("face")
      ? phraseFromWords([...words, "face"], "face")
      : /tree|forest|wood|palm|evergreen|deciduous/.test(lowered)
        ? phraseFromWords([...words, "++plant"], "++plant")
        : /mushroom|seedling|sprout|herb|shamrock|clover/.test(lowered)
          ? phraseFromWords([...words, "--plant"], "--plant")
          : lowered.includes("hand") || lowered.includes("thumb")
            ? phraseFromWords([...words, "-body"], "-body")
            : phraseFromWords(words);
  return [...new Set([name, ...words])].slice(0, 6);
}

function simplifyLabel(value, fallback = "thing") {
  const override = phraseOverrides.get(value.toLowerCase());
  return override ?? phraseFromWords(reduceWords(value, fallback), fallback);
}

function buildNewspeakUi() {
  const ui = Object.fromEntries(
    Object.entries(englishUi).map(([key, value]) => [
      key,
      uiOverrides[key] ?? simplifyLabel(String(value)),
    ]),
  );
  for (const [key, value] of Object.entries(uiOverrides)) {
    if (!(key in ui)) ui[key] = value;
  }
  return ui;
}

function buildNewspeakLocale() {
  return {
    locale: "en-x-newspeak",
    baseLocale: "en",
    label: "Newspeak English",
    nativeLabel: "Newspeak",
    rtl: false,
    cldrVersion: "custom",
    annotations: Object.fromEntries(
      Object.entries(englishLocale.annotations).map(([key, value]) => [
        key,
        annotationFor(key, value),
      ]),
    ),
    labels: Object.fromEntries(
      Object.entries(englishLocale.labels).map(([key, value]) => [
        key,
        localeLabelOverrides[key] ?? simplifyLabel(value),
      ]),
    ),
    subgroups: Object.fromEntries(
      Object.entries(englishLocale.subgroups).map(([key, value]) => [
        key,
        simplifyLabel(value),
      ]),
    ),
  };
}

function collectUniqueWords(...sources) {
  const words = new Set();
  const rootWords = new Set();
  const compounds = new Map();
  const walk = (value) => {
    if (typeof value === "string") {
      for (const word of tokenize(value)) {
        if (ignoredWordInventoryTokens.has(word) || /^\d/.test(word)) continue;
        const normalizedWord = normalizeInventoryWord(word);
        words.add(normalizedWord);
        const parts = splitCompoundWord(normalizedWord).map(
          normalizeCompoundPart,
        );
        if (parts.length > 1) {
          compounds.set(normalizedWord, parts);
          parts.forEach((part) => addRootInventoryPart(rootWords, part));
        } else if (parts[0]) {
          addRootInventoryPart(rootWords, parts[0]);
        }
      }
      return;
    }
    if (Array.isArray(value)) return value.forEach(walk);
    if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  sources.forEach(walk);
  return {
    words: [...words].sort((left, right) => left.localeCompare(right, "en")),
    rootWords: [...rootWords].sort((left, right) =>
      left.localeCompare(right, "en"),
    ),
    compounds: [...compounds.entries()].sort(([left], [right]) =>
      left.localeCompare(right, "en"),
    ),
  };
}

function buildMarkdownTable(header, rows) {
  const widths = header.map((label, index) =>
    Math.max(
      label.length,
      ...rows.map((row) => String(row[index] ?? "").length),
      1,
    ),
  );
  const formatRow = (row) =>
    `| ${row.map((cell, index) => String(cell ?? "").padEnd(widths[index], " ")).join(" | ")} |`;
  const separator = `| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`;
  return [formatRow(header), separator, ...rows.map(formatRow)].join("\n");
}

function buildWordTable(words, columns = 6) {
  const header = Array.from({ length: columns }, (_, index) => `${index + 1}`);
  const rows = [];
  for (let index = 0; index < words.length; index += columns) {
    const row = words.slice(index, index + columns);
    while (row.length < columns) row.push("");
    rows.push(row);
  }
  return buildMarkdownTable(header, rows);
}

function normalizeCompoundKey(compound) {
  return compound.replace(/^[-+]+/, "");
}

function expandCompoundParts(word) {
  return splitCompoundWord(word).flatMap((part) => {
    const normalized = normalizeCompoundPart(part);
    if (normalized !== part) return expandCompoundParts(normalized);
    return [normalized];
  });
}

function decomposeCompoundForDisplay(compound) {
  const prefix = compound.match(/^[-+]+/)?.[0] ?? "";
  const operatorParts = prefix ? [prefix] : [];
  const root = compound.slice(prefix.length);
  if (root === "oldspeak") return [...operatorParts, "old", "speak"];
  return [...operatorParts, ...expandCompoundParts(root)];
}

function choosePreferredCompound(left, right) {
  const leftPrefixCount = left[0].match(/^[-+]+/)?.[0].length ?? 0;
  const rightPrefixCount = right[0].match(/^[-+]+/)?.[0].length ?? 0;
  if (leftPrefixCount !== rightPrefixCount) {
    return leftPrefixCount < rightPrefixCount ? left : right;
  }
  return left[0].localeCompare(right[0], "en") <= 0 ? left : right;
}

function dedupeCompounds(compounds) {
  const deduped = new Map();
  compounds.forEach((entry) => {
    const normalized = normalizeCompoundKey(entry[0]);
    const existing = deduped.get(normalized);
    deduped.set(
      normalized,
      existing ? choosePreferredCompound(existing, entry) : entry,
    );
  });
  return [...deduped.values()].sort((left, right) =>
    left[0].localeCompare(right[0], "en"),
  );
}

function buildCompoundTable(compounds, groups = 2) {
  const entries = dedupeCompounds(compounds).map(([compound, parts]) => [
    compound,
    decomposeCompoundForDisplay(compound).join(" + "),
  ]);
  const header = [];
  for (let index = 0; index < groups; index += 1) {
    header.push(`Compound ${index + 1}`, `Parts ${index + 1}`);
  }
  const rows = [];
  const stride = groups;
  for (let index = 0; index < entries.length; index += stride) {
    const slice = entries.slice(index, index + stride);
    const row = [];
    slice.forEach(([compound, parts]) => {
      row.push(compound, parts);
    });
    while (row.length < groups * 2) row.push("");
    rows.push(row);
  }
  return buildMarkdownTable(header, rows);
}

function replaceGeneratedSection(source, key, content) {
  const start = `<!-- ${key}:start -->`;
  const end = `<!-- ${key}:end -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  const replacement = `${start}\n${content}\n${end}`;
  if (pattern.test(source)) return source.replace(pattern, replacement);
  return `${source.trimEnd()}\n\n${replacement}\n`;
}

function updateNewspeakDoc(rootWordCount, wordTable, compoundTable) {
  const file = path.join(root, "docs/newspeak-locale.md");
  const source = fs.readFileSync(file, "utf8");
  const wordSection = [
    "## Unique word inventory",
    "",
    "The table below is generated from the current values stored in both",
    `Newspeak locale files. It shows the root word set in use right now: ${rootWordCount} words.`,
    "",
    wordTable,
  ].join("\n");
  const compoundSection = [
    "## Compound inventory",
    "",
    "These are the combined forms now in use, along with the root words they",
    "are built from.",
    "",
    compoundTable,
  ].join("\n");
  let updated = replaceGeneratedSection(
    source,
    "newspeak-word-inventory",
    wordSection,
  );
  updated = replaceGeneratedSection(
    updated,
    "newspeak-compound-inventory",
    compoundSection,
  );
  writeFile("docs/newspeak-locale.md", updated.trimEnd());
}

const locale = buildNewspeakLocale();
const ui = buildNewspeakUi();
const words = collectUniqueWords(locale, ui);

writeFile(
  "src/data/locales/en-x-newspeak.json",
  JSON.stringify(locale, null, 2),
);
writeFile(
  "src/demo-locales/ui.en-x-newspeak.json",
  JSON.stringify(ui, null, 2),
);
updateNewspeakDoc(
  words.rootWords.length,
  buildWordTable(words.rootWords),
  buildCompoundTable(words.compounds),
);

console.info(
  `Generated Newspeak locale, UI pack, and word list with ${words.rootWords.length} root words and ${words.compounds.length} compounds.`,
);
