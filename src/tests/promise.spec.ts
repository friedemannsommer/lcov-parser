import { Readable } from 'node:stream'
import { expect } from 'chai'

import { defaultFieldNames } from '../constants.js'
import { createSection } from '../lib/handle-result.js'
import lcovParser from '../promise/index.js'
import { getTestNameEntry } from './lib/entry.js'
import { getRawLcov } from './lib/parse.js'

describe('lcovParser', (): void => {
    it('parse from stream', async (): Promise<void> => {
        const stream = new Readable({
            autoDestroy: true,
            read(): void {}
        })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(null)

        expect(await lcovParser({ from: stream })).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('parse from string', async (): Promise<void> => {
        const input = [
            getRawLcov(defaultFieldNames.testName, 'example'),
            getRawLcov(defaultFieldNames.endOfRecord)
        ].join('')

        expect(await lcovParser({ from: input })).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('parse from ArrayBuffer', async (): Promise<void> => {
        const input = Buffer.from(
            [getRawLcov(defaultFieldNames.testName, 'example'), getRawLcov(defaultFieldNames.endOfRecord)].join('')
        )

        expect(
            await lcovParser({ from: input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) })
        ).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('parse from Buffer', async (): Promise<void> => {
        const input = [
            getRawLcov(defaultFieldNames.testName, 'example'),
            getRawLcov(defaultFieldNames.endOfRecord)
        ].join('')

        expect(await lcovParser({ from: Buffer.from(input) })).to.eql([createSection(getTestNameEntry('example'))])
    })

    it("should reject if given `from` type isn't supported", async (): Promise<void> => {
        try {
            await lcovParser({ from: Promise.resolve() as unknown as string })
            expect(true).to.be.false("promise should've been rejected.")
        } catch (err) {
            expect(err).to.be.instanceof(Error)
            expect((err as Error).message).to.eq("given `from` type isn't supported.")
        }
    })
})
