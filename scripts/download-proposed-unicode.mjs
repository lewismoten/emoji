import fs from 'node:fs';
import path from 'node:path';

const requestedVersion = process.argv[2] ?? 'next';
if (requestedVersion !== 'next' && !/^\d+\.\d+(?:\.\d+)?$/.test(requestedVersion)) {
  throw new Error('Usage: npm run unicode:proposed -- [next|major.minor[.patch]]');
}

const sourceUrl = 'https://www.unicode.org/Public/draft/emoji/emoji-test.txt';
const asValue = codePoints => codePoints
  .split(' ')
  .map(code => `\\u{${code.toLowerCase()}}`)
  .join('');

const asKey = text => {
  const words = text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'And')
    .replace(/['\u2019\x60]/g, '')
    .replace(/: #/g, ' hash')
    .replace(/: \*/g, ' asterisk')
    .replace(/1st/g, ' first')
    .replace(/2nd/g, ' second')
    .replace(/3rd/g, ' third')
    .replace(/[^a-z\d]/gi, '_');
  let key = words.split('_').reduce((camel, word) =>
    word.length === 0 ? camel : camel + word[0].toUpperCase() + word.slice(1), '');
  if (/^[A-Z]+$/.test(key)) return key.toLowerCase();
  key = key.replace(/^([A-Z]+)[A-Z][a-z]/, (match, prefix) => prefix.toLowerCase() + match.slice(-2));
  key = key.replace(/[a-z][A-Z]([A-Z]+)$/, (match, suffix) => match.slice(0, 2) + suffix.toLowerCase());
  return key[0].toLowerCase() + key.slice(1);
};

const parseEmojiTest = text => {
  let group = '';
  let subGroup = '';
  const emoji = [];

  for (const line of text.split('\n')) {
    if (line.startsWith('# group: ')) {
      group = line.slice('# group: '.length).trim();
      continue;
    }
    if (line.startsWith('# subgroup: ')) {
      subGroup = line.slice('# subgroup: '.length).trim();
      continue;
    }
    if (!line.trim() || line.startsWith('#')) continue;

    const [rawCodePoints, rawStatus] = line.split(';').map(value => value.trim());
    const status = rawStatus.split('#')[0].trim();
    if (!['fully-qualified', 'component'].includes(status)) continue;

    const comment = rawStatus.slice(rawStatus.indexOf('#') + 1).trim();
    const versionMatch = comment.match(/E(\d+\.\d+)\s+(.+?)$/);
    if (!versionMatch) throw new Error(`Could not parse emoji name and version: ${line}`);
    const [, emojiVersion, shortName] = versionMatch;
    emoji.push({
      emoji: String.fromCodePoint(...rawCodePoints.split(' ').map(code => Number.parseInt(code, 16))),
      codePoints: rawCodePoints,
      status,
      shortName,
      group,
      subGroup,
      key: asKey(shortName),
      value: asValue(rawCodePoints),
      emojiVersion
    });
  }

  return emoji;
};

console.info('Downloading', sourceUrl);
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Failed to download ${sourceUrl}: ${response.status} ${response.statusText}`);
const draftText = await response.text();
const draftVersion = draftText.match(/^# Version:\s*(\d+\.\d+(?:\.\d+)?)/m)?.[1];
if (!draftVersion) throw new Error('Could not determine the Unicode version from the draft emoji data.');
if (requestedVersion !== 'next' && requestedVersion !== draftVersion) {
  throw new Error(`Requested Unicode ${requestedVersion}, but the draft data is Unicode ${draftVersion}.`);
}

const releasedEmoji = JSON.parse(fs.readFileSync('emoji.json', 'utf8'));
const releasedCodePoints = new Set(releasedEmoji.map(item => item.codePoints));
const candidates = parseEmojiTest(draftText)
  .filter(item => !releasedCodePoints.has(item.codePoints))
  .sort((a, b) => a.key.localeCompare(b.key));
const duplicateKeys = candidates.filter((item, index) => index > 0 && item.key === candidates[index - 1].key);
if (duplicateKeys.length) {
  throw new Error(`Duplicate proposed emoji keys: ${duplicateKeys.map(item => item.key).join(', ')}`);
}

const outputDirectory = 'proposed';
const outputFile = path.join(outputDirectory, `${draftVersion}.json`);
const manifestFile = path.join('versions', 'manifest.json');
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify({
  unicodeVersion: draftVersion,
  status: 'draft',
  source: sourceUrl,
  retrieved: new Date().toISOString(),
  count: candidates.length,
  emoji: candidates
}, null, 2)}\n`);
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const proposed = (manifest.proposed ?? []).filter(version => version.version !== draftVersion);
proposed.push({
  version: draftVersion,
  status: 'proposed',
  released: null,
  file: `proposed/${draftVersion}.json`,
  source: sourceUrl,
  retrieved: new Date().toISOString(),
  count: candidates.length
});
proposed.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
fs.writeFileSync(manifestFile, `${JSON.stringify({ ...manifest, proposed }, null, 2)}\n`);
console.info(`Wrote ${candidates.length} proposed Unicode Emoji ${draftVersion} entries to ${outputFile}.`);
