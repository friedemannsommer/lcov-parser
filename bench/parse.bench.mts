import { Bench } from 'tinybench'

import { defaultFieldNames } from '../src/constants.js'
import { LcovParser } from '../src/parser.js'
import lcovParser from '../src/sync/index.js'
import { chunkBuffer, generateLcov } from './fixtures.mjs'

const smallBuffer = Buffer.from(generateLcov(5, 50))
const largeBuffer = Buffer.from(generateLcov(300, 200))
const largeInSmallChunks = chunkBuffer(largeBuffer, 64)
const largeInTinyChunks = chunkBuffer(largeBuffer, 8)

async function printBench(bench: Bench): Promise<void> {
    await bench.run()
    console.log(`\n${bench.name}`)
    console.table(bench.table())
}

async function run(): Promise<void> {
    console.log(`small fixture:  ${smallBuffer.byteLength} bytes`)
    console.log(`large fixture:  ${largeBuffer.byteLength} bytes`)

    await printBench(
        new Bench({ name: 'end-to-end parse throughput (sync entrypoint)', time: 500 })
            .add('small input', () => {
                lcovParser({ from: smallBuffer })
            })
            .add('large input', () => {
                lcovParser({ from: largeBuffer })
            })
    )

    await printBench(
        new Bench({ name: 'parser construction overhead', time: 500 }).add('new LcovParser(defaultFieldNames)', () => {
            // only the construction cost is being measured
            void new LcovParser(defaultFieldNames)
        })
    )

    await printBench(
        new Bench({ name: 'write() chunking - large input', time: 500 })
            .add('single write()', () => {
                const parser = new LcovParser(defaultFieldNames)

                parser.write(largeBuffer)
                parser.flush()
            })
            .add('64-byte chunked write()', () => {
                const parser = new LcovParser(defaultFieldNames)

                for (const part of largeInSmallChunks) {
                    parser.write(part)
                }

                parser.flush()
            })
            .add('8-byte chunked write()', () => {
                const parser = new LcovParser(defaultFieldNames)

                for (const part of largeInTinyChunks) {
                    parser.write(part)
                }

                parser.flush()
            })
    )
}

await run()
