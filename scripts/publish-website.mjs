import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultSiteUrl = 'https://emoji.lewismoten.com/';
const defaultOutput = path.join(root, 'build', 'website');
const args = process.argv.slice(2);

const hasFlag = flag => args.includes(flag);
const option = (flag, fallback) => {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--'))
    throw new Error(`${flag} requires a value`);
  return value;
};
const normalizeSiteUrl = value => `${value.replace(/\/+$/, '')}/`;
const siteUrl = normalizeSiteUrl(
  option('--url', process.env.EMOJI_SITE_URL ?? defaultSiteUrl)
);
const outputDirectory = path.resolve(
  root,
  option('--output', process.env.EMOJI_SITE_OUTPUT ?? defaultOutput)
);
const publish = hasFlag('--publish');
const target = option('--target', process.env.EMOJI_DEPLOY_TARGET ?? '');
const expandHome = value =>
  value === '~' || value.startsWith(`~${path.sep}`)
    ? path.join(os.homedir(), value.slice(2))
    : value;
const identityOption = option(
  '--identity',
  process.env.EMOJI_SSH_IDENTITY ?? ''
);
const identity = identityOption ? path.resolve(expandHome(identityOption)) : '';
const transport = option(
  '--transport',
  process.env.EMOJI_DEPLOY_TRANSPORT ?? 'auto'
);
if (!['auto', 'rsync', 'tar'].includes(transport)) {
  throw new Error('--transport must be auto, rsync, or tar');
}
const skipBuild = hasFlag('--skip-build');
const deleteStale = hasFlag('--delete');

const run = (command, commandArgs, extra = {}, allowFailure = false) => {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    ...extra
  });
  if (result.error) {
    if (allowFailure && result.error.code === 'ENOENT') return { status: 127 };
    throw result.error;
  }
  if (!allowFailure && result.status !== 0)
    throw new Error(`${command} exited with status ${result.status}`);
  return result;
};
const shellQuote = value => `'${value.replaceAll("'", "'\\''")}'`;
const sshIdentityArgs = identity
  ? ['-i', identity, '-o', 'IdentitiesOnly=yes']
  : [];

const publishWithTar = async destination => {
  if (deleteStale) {
    throw new Error(
      '--delete requires rsync; omit --delete when using the tar transport'
    );
  }
  const separator = destination.indexOf(':');
  if (separator <= 0 || separator === destination.length - 1) {
    throw new Error(
      'The tar transport requires an SSH target such as user@example.com:/var/www/emoji/'
    );
  }
  const host = destination.slice(0, separator);
  const remoteDirectory = destination.slice(separator + 1);
  const remoteCommand =
    `mkdir -p -- ${shellQuote(remoteDirectory)} && ` +
    `tar -xzf - -C ${shellQuote(remoteDirectory)}`;
  const tarArgs = ['-C', outputDirectory];
  if (process.platform === 'darwin') tarArgs.push('--no-xattrs');
  tarArgs.push('-czf', '-', '.');
  const archive = spawn('tar', tarArgs, {
    cwd: root,
    env: { ...process.env, COPYFILE_DISABLE: '1' },
    stdio: ['ignore', 'pipe', 'inherit']
  });
  const ssh = spawn('ssh', [...sshIdentityArgs, host, remoteCommand], {
    cwd: root,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  archive.stdout.pipe(ssh.stdin);
  const waitFor = (child, name) =>
    new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`${name} exited with status ${code}`));
      });
    });
  await Promise.all([waitFor(archive, 'tar'), waitFor(ssh, 'ssh')]);
};

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
if (!skipBuild) {
  run(npm, ['run', 'bundle']);
  run(npm, ['run', 'pixel-font:build', '--', '--fonts-only', '--optimize']);
}

const forbiddenOutputs = new Set([
  path.parse(outputDirectory).root,
  root,
  os.homedir()
]);
if (forbiddenOutputs.has(outputDirectory)) {
  throw new Error(
    `Refusing to replace unsafe output directory: ${outputDirectory}`
  );
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const files = [
  'index.html',
  'index.js',
  'pixel-editor.js',
  'emoji.json',
  'manifest.json',
  'screenshot.png',
  'favicon.svg',
  'manifest.webmanifest',
  'offline.html',
  'robots.txt',
  'sitemap.xml'
];
const directories = [
  'icons',
  'dist',
  'locales',
  'demo-locales',
  'explorer',
  'orders',
  'versions',
  'proposed'
];
for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outputDirectory, file));
}
for (const directory of directories) {
  fs.cpSync(path.join(root, directory), path.join(outputDirectory, directory), {
    recursive: true
  });
}
fs.mkdirSync(path.join(outputDirectory, 'pixel-font'), { recursive: true });
fs.cpSync(
  path.join(root, 'pixel-font', 'build'),
  path.join(outputDirectory, 'pixel-font', 'build'),
  { recursive: true }
);
fs.cpSync(
  path.join(root, 'pixel-font', 'atlases'),
  path.join(outputDirectory, 'pixel-font', 'atlases'),
  { recursive: true }
);

run(
  process.execPath,
  [path.join(root, 'scripts', 'generate-demo-pages.mjs'), outputDirectory],
  { env: { ...process.env, EMOJI_SITE_URL: siteUrl } }
);
run(process.execPath, [
  path.join(root, 'scripts', 'generate-service-worker.mjs'),
  path.join(outputDirectory, 'service-worker.js')
]);

const normalizeWebsitePermissions = directory => {
  fs.chmodSync(directory, 0o755);
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const targetPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      normalizeWebsitePermissions(targetPath);
    } else if (entry.isFile()) {
      fs.chmodSync(targetPath, 0o644);
    }
  }
};
normalizeWebsitePermissions(outputDirectory);

run(process.execPath, [
  path.join(root, 'scripts', 'validate-pages-site.mjs'),
  outputDirectory
]);

fs.writeFileSync(path.join(outputDirectory, '.nojekyll'), '');
console.info(`Website ready at ${outputDirectory}`);
console.info(`Canonical URL: ${siteUrl}`);

if (!publish) process.exit(0);
if (!target) {
  throw new Error(
    'Publishing requires --target or EMOJI_DEPLOY_TARGET, for example user@example.com:/var/www/emoji/'
  );
}

const rsyncArgs = ['--archive', '--compress', '--checksum'];
if (identity) {
  if (!fs.existsSync(identity))
    throw new Error(`SSH identity file does not exist: ${identity}`);
  rsyncArgs.push(
    '--rsh',
    `ssh -i ${shellQuote(identity)} -o IdentitiesOnly=yes`
  );
}
if (deleteStale) rsyncArgs.push('--delete-delay');
rsyncArgs.push(`${outputDirectory}${path.sep}`, target);
if (transport === 'tar') {
  await publishWithTar(target);
} else {
  const result = run('rsync', rsyncArgs, {}, transport === 'auto');
  if (result.status !== 0) {
    if (result.status !== 127) {
      throw new Error(`rsync exited with status ${result.status}`);
    }
    console.warn('Remote rsync is unavailable; retrying with tar over SSH.');
    await publishWithTar(target);
  }
}
console.info(`Published ${siteUrl} to ${target}`);
