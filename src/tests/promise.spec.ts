import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { describe, it } from 'node:test'

import { defaultFieldNames } from '../constants.js'
import { createSection } from '../lib/handle-result.js'
import lcovParser from '../promise/index.js'
import { getTestNameEntry } from './lib/entry.js'
import { getRawLcov } from './lib/parse.js'

describe('promise/lcovParser', (): void => {
    it('parse from stream', async (): Promise<void> => {
        const stream = new Readable({
            autoDestroy: true,
            read(): void {}
        })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(null)

        assert.deepStrictEqual(await lcovParser({ from: stream }), [createSection(getTestNameEntry('example'))])
    })

    it('parse from string', async (): Promise<void> => {
        const input = [
            getRawLcov(defaultFieldNames.testName, 'example'),
            getRawLcov(defaultFieldNames.endOfRecord)
        ].join('')

        assert.deepStrictEqual(await lcovParser({ from: input }), [createSection(getTestNameEntry('example'))])
    })

    it('parse from ArrayBuffer', async (): Promise<void> => {
        const input = Buffer.from(
            [getRawLcov(defaultFieldNames.testName, 'example'), getRawLcov(defaultFieldNames.endOfRecord)].join('')
        )

        assert.deepStrictEqual(
            await lcovParser({ from: input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) }),
            [createSection(getTestNameEntry('example'))]
        )
    })

    it('parse from Buffer', async (): Promise<void> => {
        const input = [
            getRawLcov(defaultFieldNames.testName, 'example'),
            getRawLcov(defaultFieldNames.endOfRecord)
        ].join('')

        assert.deepStrictEqual(await lcovParser({ from: Buffer.from(input) }), [
            createSection(getTestNameEntry('example'))
        ])
    })

    it("should reject if given `from` type isn't supported", async (): Promise<void> => {
        try {
            await lcovParser({ from: Promise.resolve() as unknown as string })
            assert.fail("promise should've been rejected.")
        } catch (err) {
            assert.ok(err instanceof Error)
            assert.strictEqual((err as Error).message, "given `from` type isn't supported.")
        }
    })
})
