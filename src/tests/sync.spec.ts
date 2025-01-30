import { expect } from 'chai'
import { defaultFieldNames } from '../constants.js'
import { createSection } from '../lib/handle-result.js'
import lcovParser from '../sync/index.js'
import { getTestNameEntry } from './lib/entry.js'
import { getRawLcov } from './lib/parse.js'

describe('sync/lcovParser', () => {
    const input = [getRawLcov(defaultFieldNames.testName, 'example'), getRawLcov(defaultFieldNames.endOfRecord)].join(
        ''
    )

    it('should parse string input correctly', () => {
        const result = lcovParser({
            from: input
        })

        expect(result).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('should parse ArrayBuffer input correctly', () => {
        const result = lcovParser({
            from: new TextEncoder().encode(input).buffer
        })

        expect(result).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('should parse Buffer input correctly', () => {
        const result = lcovParser({
            from: Buffer.from(input, 'utf-8')
        })

        expect(result).to.eql([createSection(getTestNameEntry('example'))])
    })

    it('should throw error for unsupported input type', () => {
        expect(() =>
            lcovParser({
                // biome-ignore lint/suspicious/noExplicitAny: Using null to simulate unsupported type
                from: null as any
            })
        ).to.throw(Error)
    })
})
