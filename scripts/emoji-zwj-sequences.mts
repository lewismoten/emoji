import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@codejamboree/js-logger';
import { webRequest } from '@codejamboree/web-request-queue';

const cachePath = 'cache';
const fileName = 'emoji-zwj-sequences.txt';
const jsonName = 'emoji-zwj-sequences.json';

const categoryPrefix = '# RGI_Emoji_ZWJ_Sequence: ';

const main = async () => {
  if (!fs.existsSync(cachePath))
    fs.mkdirSync(cachePath, { recursive: true });

  const cacheFilePath = path.join(cachePath, fileName);
  if (!fs.existsSync(cacheFilePath)) {
    const url = `https://unicode.org/Public/emoji/16.0/${fileName}`;
    console.info(`Downloading`, url)
    await webRequest.toFile(cacheFilePath, url);
  }

  console.info('Reading', cacheFilePath);

  const text = fs.readFileSync(cacheFilePath, 'utf-8');
  const lines = text.split('\n');
  console.debug('Lines of text', lines.length);

  const categories = lines.filter(isCategory).map(asCategory(lines));
  console.debug('Categories', categories.length);

  const dataLines = lines.filter(isData)
  console.debug('Lines of data', dataLines.length);

  const data = dataLines.map(asData(categories, lines));

  const emoji = data.reduce<string[]>((all, { emoji }) => [...all, emoji], []);
  console.debug('Emoji found', emoji.length);

  const jsonPath = path.join(cachePath, jsonName);

  console.info('Writing JSON', jsonPath)
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(data, null, '  ')
  );
}

const isCategory = (line: string) => line.startsWith(categoryPrefix);

interface Category { index: number, name: string };

const asCategory = (lines: string[]) => (line: string): Category => ({
  index: lines.indexOf(line),
  name: line.replace(categoryPrefix, '')
})

const isData = (line: string) => {
  const trimmed = line.trim();
  return !(trimmed.length === 0 || trimmed.startsWith('#'));
}
const asData = (categories: Category[], lines: string[]) => (line: string) => {

  const index = lines.indexOf(line);
  const category = categories.filter(category => category.index < index).at(-1)!;

  const [codePoints, type, shortName] =
    line.split(';').map(cell => cell.trim());

  return {
    emoji: asEmoji(codePoints),
    codePoints: codePoints,
    type,
    category: category?.name,
    shortName: parseShortName(shortName)
  }
}
const parseShortName = (text: string) => text.split('#')[0].trim();

const asEmoji = (codePoints: string) =>
  codePoints
    .split(' ')
    .map(code => parseInt(code, 16))
    .map(code => {
      try {
        return String.fromCodePoint(code)
      } catch (e) {
        console.error('failed', code, codePoints)
        throw e;
      }
    })
    .join('')

try {
  logger.attach();
  logger.title('Emoji ZWJ Sequences');
  main()
    .catch(logger.logError)
    .finally(logger.done);
} catch (e) {
  logger.logError(e);
  logger.done();
}
