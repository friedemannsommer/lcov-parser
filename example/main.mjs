import { createReadStream } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { defaultFieldNames } from '../dist/constants.mjs'
import { LcovParser } from '../dist/parser.mjs'
import lcovParserPromise from '../dist/promise/index.mjs'

const lcovFile = createReadStream(new URL('./lcov.info', import.meta.url))

await Promise.all([writeNodes(lcovFile), writeSections(lcovFile)])

function writeNodes(file) {
    const parser = new LcovParser(defaultFieldNames)
    let nodes = []

    return new Promise((resolve, reject) => {
        function handleChunk(chunk) {
            parser.write(chunk)
            nodes = nodes.concat(parser.flush())
        }

        function handleError(err) {
            unsubscribe()
            reject(err)
        }

        function handleEnd() {
            unsubscribe()
            writeFile(new URL('./nodes.json', import.meta.url), JSON.stringify(nodes, undefined, 2)).then(
                resolve,
                reject
            )
        }

        function unsubscribe() {
            file.off('data', handleChunk)
            file.off('error', handleError)
            file.off('end', handleEnd)
        }

        file.on('data', handleChunk)
        file.once('error', handleError)
        file.once('end', handleEnd)
    })
}

async function writeSections(file) {
    await writeFile(
        new URL('./sections.json', import.meta.url),
        JSON.stringify(await lcovParserPromise({ from: file }), undefined, 2)
    )
}
