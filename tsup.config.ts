import {defineConfig} from 'tsup'

export default defineConfig([
  {
    entry: ['src/cli.tsx'],
    format: 'esm',
    target: 'node18',
    clean: true,
    banner: {js: '#!/usr/bin/env node'},
  },
  {
    entry: {'server/index': 'src/server/index.ts'},
    format: 'esm',
    target: 'node18',
    clean: false,
    banner: {js: '#!/usr/bin/env node'},
    outDir: 'dist',
  },
])
