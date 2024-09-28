import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@codejamboree/js-logger';

const cachePath = 'cache';
const testFile = 'emoji-test.json';

interface Emoji {
  emoji: string,
  codePoints: string,
  shortName: string
}
interface TestEmoji extends Emoji {
  status: string,
  group: string,
  subGroup: string
}

const main = async () => {
  if (!fs.existsSync(cachePath))
    fs.mkdirSync(cachePath, { recursive: true });

  const test = readJson<TestEmoji>(testFile);

  const unique = test.filter(({ status }) => ['fully-qualified', 'component'].includes(status));

  const parsed = unique.map(item => {
    const key = parseKey(item.shortName);
    const unicodeEscape = parseUnicodeEscape(item.codePoints);
    const shortName = item.shortName;
    return [key, unicodeEscape, shortName];
  });

  const emojiJsBody = parsed
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value, name]) => [
      `/** ${name} ${eval(`"${value}"`)} */`,
      `${key}: "${value}" as "${value}"`
    ].join('\n  '))
    .join(",\n  ");


  // setup rest of code template
  const emojiJs = [
    "export default {",
    `  ${emojiJsBody}`,
    "};",
    ""
  ].join('\r\n');
  fs.writeFileSync('emoji.ts', emojiJs, 'utf8')
}
const parseUnicodeEscape = (codePoints: string): string => codePoints
  .split(' ')
  .map(code => `\\u\{${code.toLowerCase()}\}`)
  .join('');;

const parseWordsAndSpaces = (text: string) => {
  return text.normalize("NFD") // decompose into characters + combining marks
    .replace(/[\u0300-\u036f]/g, '') // remove combining marks
    // Spell it out
    .replace(/[&]/g, "And")
    // remove apostrophes
    .replace(/['\u2019\x60]/g, "")
    .replace(/: #/g, " hash")
    .replace(/: \*/g, " asterisk")
    .replace(/1st/g, " first")
    .replace(/2nd/g, " second")
    .replace(/3rd/g, " third")
    // we only want letters and numbers for key names.
    // change reset to underscore
    .replace(/[^a-z\d]/gi, "_")
}

const noBigHumps = (text: string): string => {
  // Fix all-caps: ZZZ
  if (/^[A-Z]+$/.test(text)) return text.toLowerCase();
  // Fix initial caps: OKButton, BACKArrow
  text = text.replace(/^([A-Z]+)[A-Z][a-z]/, (search, replace) => {
    return replace.toLowerCase() + search.slice(-2)
  });

  // Fix endings: personGesturingOK womanGesturingNO
  text = text.replace(/[a-z][A-Z]([A-Z]+)$/, (search, replace) => {
    return search.slice(0, 2) + replace.toLowerCase()
  });

  text = text.charAt(0).toLowerCase() + text.slice(1);

  return text;
}
const camelCase = (text: string): string =>
  noBigHumps(text.split("_")
    .reduce(
      (camel, hump) =>
        hump.length === 0
          ? camel
          : camel + hump.charAt(0).toUpperCase() + hump.slice(1),
      ""
    ));

const parseKey = (text: string): string => camelCase(parseWordsAndSpaces(text));


const readJson = <T extends object = object>(fileName: string): T[] => {
  const filePath = path.join(cachePath, fileName);
  console.info('Reading', filePath);
  const json = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(json) as T[];
}

try {
  logger.attach();
  logger.title('Emoji Parse');
  main()
    .catch(logger.logError)
    .finally(logger.done);
} catch (e) {
  logger.logError(e);
  logger.done();
}
