import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import fc from 'fast-check'

import lcovParser from '../sync/index.js'

describe('sync/lcovParser - property', (): void => {
    it('never throws when fed arbitrary bytes', (): void => {
        fc.assert(
            fc.property(fc.uint8Array({ maxLength: 4_096 }), (bytes): void => {
                assert.doesNotThrow((): void => {
                    lcovParser({ from: Buffer.from(bytes) })
                })
            })
        )
    })

    it('never throws when fed arbitrary text', (): void => {
        fc.assert(
            fc.property(fc.string({ maxLength: 4_096 }), (from): void => {
                assert.doesNotThrow((): void => {
                    lcovParser({ from })
                })
            })
        )
    })
})
