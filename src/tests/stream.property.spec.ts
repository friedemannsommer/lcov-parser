import { describe, it } from 'node:test'

import fc from 'fast-check'

import LcovStreamParser from '../stream/index.js'

const EXPECTED_ERROR_MESSAGE = 'unexpected end of input.'

function runStream(chunks: Buffer[]): Promise<void> {
    return new Promise((resolve, reject): void => {
        const parser = new LcovStreamParser()

        parser.resume()
        parser.once('error', (err: Error): void => {
            if (err.message === EXPECTED_ERROR_MESSAGE) {
                resolve()
            } else {
                reject(err)
            }
        })
        parser.once('finish', resolve)

        for (const chunk of chunks) {
            parser.write(chunk)
        }

        parser.end()
    })
}

describe('LcovStreamParser - property', (): void => {
    it('never emits an unexpected error when fed arbitrary bytes', async (): Promise<void> => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(fc.uint8Array({ maxLength: 256 }), { maxLength: 16 }),
                async (chunks): Promise<void> => {
                    await runStream(chunks.map((chunk) => Buffer.from(chunk)))
                }
            ),
            { numRuns: 50 }
        )
    })
})
