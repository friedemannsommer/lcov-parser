import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import ByteMatch from '../lib/byte-match.js'

describe('ByteMatch - buffer size', (): void => {
    for (let bufferSize = 1; bufferSize < 100; bufferSize++) {
        it(`should compare and match a buffer with size ${bufferSize}`, () => {
            const buffer = Array(bufferSize)
                .fill(0)
                .map((_, index) => index)
            const instance = new ByteMatch(new Uint8Array(buffer))

            assert.strictEqual(instance.size, bufferSize)

            for (let index = 0; index < bufferSize; index++) {
                assert.ok(instance.compare(buffer[index]))
            }

            assert.ok(instance.matched())
        })
    }
})

describe('ByteMatch - reset', (): void => {
    it('should reset match cursor', () => {
        const instance = new ByteMatch(new Uint8Array([0, 1, 2]))

        assert.ok(instance.compare(0))
        assert.ok(instance.compare(1))

        instance.reset()

        assert.strictEqual(instance.compare(2), false)
        assert.strictEqual(instance.matched(), false)
    })
})

describe('ByteMatch - out of order', (): void => {
    it('should not match values out of order', () => {
        const instance = new ByteMatch(new Uint8Array([0, 1, 2]))

        assert.strictEqual(instance.compare(2), false)
        assert.strictEqual(instance.compare(1), false)
        assert.ok(instance.compare(0))
        assert.strictEqual(instance.matched(), false)
    })

    it('should not match partial values', () => {
        const instance = new ByteMatch(new Uint8Array([0, 1, 2]))

        assert.strictEqual(instance.compare(1), false)
        assert.strictEqual(instance.compare(2), false)
        assert.strictEqual(instance.matched(), false)
    })
})
