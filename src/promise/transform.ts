import { Readable } from 'node:stream'

import transformResult from '../lib/transform-result.js'
import { updateResult } from '../lib/handle-result.js'
import { LcovParser, ParseResult } from '../parser.js'
import { SectionSummary } from '../typings/file.js'

export function transformSynchronous(results: ParseResult[]): SectionSummary[] {
    const functionMap = new Map<string, number>()
    const result: SectionSummary[] = []
    let sectionIndex = 0

    for (const parseResult of results) {
        sectionIndex = updateResult(sectionIndex, transformResult(parseResult), functionMap, result)
    }

    return result
}

export function transformAsynchronous(parser: LcovParser, stream: Readable): Promise<SectionSummary[]> {
    const functionMap = new Map<string, number>()
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
                sectionIndex = updateResult(sectionIndex, transformResult(parseResult), functionMap, result)
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
