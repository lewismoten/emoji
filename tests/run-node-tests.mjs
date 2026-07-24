import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] ?? 'build/tests');
const testPattern = /\.test\.(?:js|mjs|cjs)$/;

function findTests(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory()
        ? findTests(file)
        : testPattern.test(entry.name)
          ? [file]
          : [];
    })
    .sort();
}

const tests = findTests(root);
if (tests.length === 0) {
  console.error(`No compiled Node tests found under ${root}`);
  process.exitCode = 1;
} else {
  const result = spawnSync(process.execPath, ['--test', ...tests], {
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
