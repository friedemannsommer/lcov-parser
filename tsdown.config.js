import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: {
        index: './src/index.ts',
        constants: './src/constants.ts',
        'lib/field-variant': './src/lib/field-variant.ts',
        parser: './src/parser.ts',
        'promise/index': './src/promise/index.ts',
        'stream/index': './src/stream/index.ts',
        'sync/index': './src/sync/index.ts',
    },
    format: ['esm', 'cjs'],
    platform: 'node',
    clean: true,
    dts: true,
    minify: true,
    attw: { profile: 'node16' },
    publint: true,
    unused: true,
})
