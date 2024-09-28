import fs from 'node:fs';
import path from 'node:path';

import { logger } from '@codejamboree/js-logger';
import { webRequest } from '@codejamboree/web-request-queue';

const cachePath = 'cache';
const fileName = 'emoji-test.txt';
const jsonName = 'emoji-test.json';

const GROUP = 'group';
const SUBGROUP = 'subgroup';

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

  const groups = lines
    .filter(isPrefixed(GROUP))
    .map(asIndexed(lines));
  console.debug('Groups', groups.length);
  const subGroups = lines
    .filter(isPrefixed(SUBGROUP))
    .map(asIndexed(lines));
  console.debug('SubGroups', subGroups.length);

  const dataLines = lines.filter(isData)
  console.debug('Lines of data', dataLines.length);

  const data = dataLines.map(asData(groups, subGroups, lines));

  const emoji = data.reduce<string[]>((all, { emoji }) => [...all, emoji], []);
  console.debug('Emoji found', emoji.length);

  const jsonPath = path.join(cachePath, jsonName);

  console.info('Writing JSON', jsonPath)
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(data, null, '  ')
  );
}

const isPrefixed = (prefix: string) => (line: string) => line.startsWith(`# ${prefix}: `);

interface Indexed { index: number, name: string };

const asIndexed = (lines: string[]) => (line: string): Indexed => ({
  index: lines.indexOf(line),
  name: line.split(':', 2)[1].trim()
})

const isData = (line: string) => {
  const trimmed = line.trim();
  return !(trimmed.length === 0 || trimmed.startsWith('#'));
}
const lookup = (indexed: Indexed[], index: number): string =>
  indexed.findLast(item => item.index < index)!.name

const asData = (groups: Indexed[], subGroups: Indexed[], lines: string[]) => (line: string) => {

  const index = lines.indexOf(line);
  const group = lookup(groups, index);
  const subGroup = lookup(subGroups, index);

  const [codePoints, status] =
    line.split(';').map(cell => cell.trim());

  return {
    emoji: asEmoji(codePoints),
    codePoints: codePoints,
    status: parseStatus(status),
    shortName: parseShortName(status),
    group,
    subGroup
  }
}
const parseStatus = (text: string) => text.split('#')[0].trim();
const parseShortName = (text: string) => {
  const comment = text.substring(text.indexOf('#') + 1).trim();
  try {
    const [, name] = comment.match(/E\d+\.\d+\s+(.+?)$/)!;
    return name;
  }
  catch (e) {
    console.error('couldnot parse', text);
    return 'ERROR:' + comment;
  }
}

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
  logger.title('Emoji Test');
  main()
    .catch(logger.logError)
    .finally(logger.done);
} catch (e) {
  logger.logError(e);
  logger.done();
}
