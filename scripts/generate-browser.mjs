import fs from 'node:fs';

const license = fs.readFileSync('LICENSE.md', 'utf8').trim();
const banner = `/**\n${license}\n */`;
const emoji = JSON.parse(fs.readFileSync('emoji.json', 'utf8'));
const properties = emoji.map(({ key, shortName, emoji: value, value: escaped }) =>
  `    /** ${shortName} ${value} */\n    ${key}: "${escaped}",`
);

const source = [
  banner,
  '',
  'var emoji = {',
  ...properties,
  '};',
  '',
  'export { emoji as default };',
  ''
].join('\n');

fs.mkdirSync('dist/esm', { recursive: true });
fs.writeFileSync('dist/esm/index.js', source, 'utf8');
console.info(`Generated browser bundle with ${emoji.length} emoji entries.`);
