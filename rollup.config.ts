import fs from 'node:fs';
import path from 'node:path';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import license from 'rollup-plugin-license';
import { OutputOptions, RollupOptions } from 'rollup';

const read = (file: string) => fs.readFileSync(file, 'utf-8');
const banner = read('LICENSE.md');

const files = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });

const sourceDirectory = 'library';
const javascriptDirectory = 'build/library';
const inputs = (directory: string) => Object.fromEntries(
  files(directory)
    .filter(file => file.endsWith(directory === sourceDirectory ? '.ts' : '.js'))
    .map(file => [path.relative(directory, file).replace(/\.[^.]+$/, ''), file])
);

const output = (format: 'es' | 'cjs', production: boolean): OutputOptions => ({
  dir: format === 'es' ? 'dist/esm' : 'dist/commonjs',
  format,
  sourcemap: true,
  preserveModules: true,
  preserveModulesRoot: javascriptDirectory,
  entryFileNames: production ? `[name].min.${format === 'es' ? 'js' : 'cjs'}` : `[name].${format === 'es' ? 'js' : 'cjs'}`,
  chunkFileNames: production ? `[name]-[hash].min.${format === 'es' ? 'js' : 'cjs'}` : `[name]-[hash].${format === 'es' ? 'js' : 'cjs'}`,
  plugins: [license({ banner }), ...(production ? [terser()] : [])]
});

const javascript = (format: 'es' | 'cjs', production: boolean): RollupOptions => ({
  input: inputs(javascriptDirectory),
  output: output(format, production),
  plugins: [
    resolve({ browser: false, preferBuiltins: true }),
    ...(format === 'cjs' ? [commonjs()] : [])
  ]
});

const types = (format: 'es' | 'cjs'): RollupOptions => ({
  input: inputs(sourceDirectory),
  output: {
    dir: `dist/${format === 'es' ? 'esm' : 'commonjs'}/types`,
    format,
    preserveModules: true,
    preserveModulesRoot: sourceDirectory,
    entryFileNames: `[name].d.${format === 'es' ? 'mts' : 'ts'}`
  },
  plugins: [dts()]
});

export default [
  javascript('es', false),
  javascript('es', true),
  javascript('cjs', false),
  javascript('cjs', true),
  types('es'),
  types('cjs')
] satisfies RollupOptions[];
