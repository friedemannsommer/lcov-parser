import { Readable } from 'node:stream'

import { Variant } from '../constants.js'
import { FunctionMap, updateResults } from '../lib/handle-result.js'
import transformResult from '../lib/transform-result.js'
import { LcovParser, ParseResult } from '../parser.js'
import type { SectionSummary } from '../typings/file.js'

export function transformSynchronous(results: ParseResult[]): SectionSummary[] {
    const functionMap: FunctionMap = new Map()
    const result: SectionSummary[] = []
    let sectionIndex = 0

    for (const parseResult of results) {
        const entry = transformResult(parseResult)

        if (entry.variant !== Variant.None) {
            sectionIndex = updateResults(sectionIndex, entry, functionMap, result)
        }
    }

    return result
}

export function transformAsynchronous(parser: LcovParser, stream: Readable): Promise<SectionSummary[]> {
    const functionMap: FunctionMap = new Map()
    const result: SectionSummary[] = []
    let sectionIndex = 0

    return new Promise((resolve, reject): void => {
        function handleChunk(chunk: unknown): void {
            if (typeof chunk === 'string') {
                parser.write(Buffer.from(chunk))
            } else if (Buffer.isBuffer(chunk)) {
                parser.write(chunk)
            } else {
                unsubscribe()
                reject(new Error('received unsupported chunk type.'))
                return
            }

            for (const parseResult of parser.flush()) {
                const entry = transformResult(parseResult)

                if (entry.variant !== Variant.None) {
                    sectionIndex = updateResults(sectionIndex, entry, functionMap, result)
                }
            }
        }

        function handleEnd(): void {
            unsubscribe()
            resolve(result)
        }

        function handleError(err: Error): void {
            unsubscribe()
            reject(err)
        }

        function unsubscribe(): void {
            stream.off('data', handleChunk)
            stream.off('error', handleError)
            stream.off('end', handleEnd)
        }

        stream.on('data', handleChunk)
        stream.once('error', handleError)
        stream.once('end', handleEnd)
    })
}
