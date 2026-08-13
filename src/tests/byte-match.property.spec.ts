import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import fc from 'fast-check'

import ByteMatch from '../lib/byte-match.js'

const symbol = fc.integer({ min: 0, max: 3 })

describe('ByteMatch - property', (): void => {
    it('only reports a match when the pattern occurs contiguously, ending at the current byte', (): void => {
        fc.assert(
            fc.property(
                fc.array(symbol, { minLength: 2, maxLength: 8 }).map((bytes) => new Uint8Array(bytes)),
                fc.array(symbol, { minLength: 1, maxLength: 64 }),
                (pattern, input): void => {
                    const matcher = new ByteMatch(new Uint8Array(pattern))

                    for (let index = 0; index < input.length; index++) {
                        matcher.compare(input[index])

                        if (matcher.matched()) {
                            const start = index - pattern.length + 1

                            assert.ok(start >= 0, 'matched before enough bytes were consumed')
                            assert.deepStrictEqual(input.slice(start, index + 1), Array.from(pattern))
                        }
                    }
                }
            )
        )
    })
})
