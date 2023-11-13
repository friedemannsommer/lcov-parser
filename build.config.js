import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    clean: true,
    declaration: true,
    entries: [
        './src/index.ts',
        './src/constants.ts',
        './src/lib/field-variant.ts',
        './src/parser.ts',
        './src/promise/index.ts',
        './src/stream/index.ts'
    ],
    outDir: 'dist',
    rollup: {
        emitCJS: true,
        esbuild: {
            minify: false,
            platform: 'neutral',
            target: 'node16',
            treeShaking: true
        },
        output: {
            exports: 'named',
            generatedCode: 'es2015'
        }
    }
})
