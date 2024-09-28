import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

import { logger } from '@codejamboree/js-logger';
import { webRequest } from '@codejamboree/web-request-queue';

const cachePath = 'cache';
const fileName = 'emoji-sequences.txt';
const jsonName = 'emoji-sequences.json';

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
  const dataLines = lines.filter(isData)
  console.debug('Lines of data', dataLines.length);
  const data = dataLines.map(asData).flat();
  console.debug('Emoji found', data.length);

  const jsonPath = path.join(cachePath, jsonName);

  console.info('Writing JSON', jsonPath)
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(data, null, '  ')
  );
}

const isData = (line: string) => {
  const trimmed = line.trim();
  return !(trimmed.length === 0 || trimmed.startsWith('#'));
}
const asData = (line: string) => {
  const [rawCodePoints, type, rawShortNames] =
    line.split(';').map(cell => cell.trim());

  const emoji = parseEmoji(rawCodePoints);
  const codePoints = parseCodePoints(rawCodePoints);
  const shortNames = parseShortNames(rawShortNames);

  return emoji.map((emoji, index) => ({
    emoji,
    type,
    codePoints: codePoints[index],
    shortName: shortNames[index]
  }));
}
const parseShortNames = (text: string) => {
  // firstName..lastName # E0.6   [count] (firstEmoji..lastEmoji)
  const [nameRange, comment] = text.split('#');
  const [, countText] = comment.match(/\[(\d+)\]/i)!;
  const count = parseInt(countText, 10);
  const names = new Array(count);
  const known = nameRange.trim().split('..');
  names[0] = known[0];
  names[names.length - 1] = known[known.length - 1];
  return names;
}
const parseCodePoints = (text: string) => {
  if (/^[\dA-F]{4,5}\.\.[\dA-F]{4,5}$/.test(text)) {
    const [startCode, endCode] = text.split('..');
    const start = parseInt(startCode, 16);
    const end = parseInt(endCode, 16);
    const codePoints = [];
    for (let code = start; code <= end; code++) {
      codePoints.push(code.toString(16).toUpperCase());
    }
    return codePoints;
  }
  if (/^([\dA-F]{4,5} )*[\dA-F]{4,5}$/.test(text)) {
    return [text];
  }
  console.warn('Unrecognized format', text);
  return [text];
}

const parseEmoji = (text: string) => {
  return parseCodePoints(text)
    .map(codePoints =>
      codePoints.split(' ')
        .map(code => parseInt(code, 16))
        .map(code => {
          try {
            return String.fromCodePoint(code)
          } catch (e) {
            console.error('failed', code, text, parseCodePoints(text))
            throw e;
          }
        })
        .join('')
    )
}

try {
  logger.attach();
  logger.title('Emoji Sequences');
  main()
    .catch(logger.logError)
    .finally(logger.done);
} catch (e) {
  logger.logError(e);
  logger.done();
}
