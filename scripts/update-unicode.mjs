import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const emojiVersion = process.argv[2] ?? '17.0';
if (!/^\d+\.\d+(?:\.\d+)?$/.test(emojiVersion)) {
  throw new Error('Usage: npm run unicode -- <major.minor[.patch]>');
}

const unicodeVersion = emojiVersion.split('.').length === 2
  ? `${emojiVersion}.0`
  : emojiVersion;
const cacheDirectory = 'cache';
const files = [
  ['emoji/emoji-test.txt', `emoji-test-${emojiVersion}.txt`],
  ['emoji/emoji-sequences.txt', `emoji-sequences-${emojiVersion}.txt`],
  ['emoji/emoji-zwj-sequences.txt', `emoji-zwj-sequences-${emojiVersion}.txt`],
  ['ucd/emoji/emoji-data.txt', `emoji-data-${emojiVersion}.txt`],
  ['ucd/emoji/emoji-variation-sequences.txt', `emoji-variation-sequences-${emojiVersion}.txt`]
];

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
    const shortName = comment.match(/E\d+\.\d+\s+(.+?)$/)?.[1];
    if (!shortName) throw new Error(`Could not parse emoji name: ${line}`);
    const value = asValue(rawCodePoints);
    emoji.push({
      emoji: String.fromCodePoint(...rawCodePoints.split(' ').map(code => Number.parseInt(code, 16))),
      codePoints: rawCodePoints,
      status,
      shortName,
      group,
      subGroup,
      key: asKey(shortName),
      value
    });
  }
  emoji.sort((a, b) => a.key.localeCompare(b.key));

  const duplicateKeys = emoji.filter((item, index) => index > 0 && item.key === emoji[index - 1].key);
  if (duplicateKeys.length) throw new Error(`Duplicate emoji keys: ${duplicateKeys.map(item => item.key).join(', ')}`);
  return emoji;
};

const download = async (source, destination) => {
  const url = `https://www.unicode.org/Public/${unicodeVersion}/${source}`;
  console.info('Downloading', url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
};

fs.mkdirSync(cacheDirectory, { recursive: true });
for (const [source, file] of files) {
  await download(source, path.join(cacheDirectory, file));
}

const testFile = path.join(cacheDirectory, `emoji-test-${emojiVersion}.txt`);
const emoji = parseEmojiTest(fs.readFileSync(testFile, 'utf8'));
const source = [
  'export default {',
  ...emoji.map(item => `  /** ${item.shortName} ${item.emoji} */\n  ${item.key}: "${item.value}" as const,`),
  '} as const;',
  ''
].join('\n');

fs.writeFileSync('emoji.json', `${JSON.stringify(emoji, null, '  ')}\n`);
fs.writeFileSync('emoji.ts', source);
console.info(`Generated ${emoji.length} Unicode Emoji ${emojiVersion} entries.`);

execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
