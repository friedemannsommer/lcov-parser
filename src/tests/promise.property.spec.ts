import { describe, it } from 'node:test'

import fc from 'fast-check'

import lcovParser from '../promise/index.js'

describe('promise/lcovParser - property', (): void => {
    it('never rejects unexpectedly when fed arbitrary bytes', async (): Promise<void> => {
        await fc.assert(
            fc.asyncProperty(fc.uint8Array({ maxLength: 4_096 }), async (bytes): Promise<void> => {
                await lcovParser({ from: Buffer.from(bytes) })
            })
        )
    })

    it('never rejects unexpectedly when fed arbitrary text', async (): Promise<void> => {
        await fc.assert(
            fc.asyncProperty(fc.string({ maxLength: 4_096 }), async (from): Promise<void> => {
                await lcovParser({ from })
            })
        )
    })
})
