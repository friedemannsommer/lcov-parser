import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    clean: true,
    declaration: true,
    outDir: 'dist',
    rollup: {
        emitCJS: true,
        esbuild: {
            // reduce the overall package size by minifying the generated code.
            // this isn't a "perfect" solution,
            // but unless someone really wants to see the actual code
            // (which they can by simply visiting GitHub),
            // this will save roughly 20%.
            minify: true,
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
