import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import List from '../lib/list.js'

describe('List', (): void => {
    it('should correctly update `size` on `insert`', (): void => {
        const instance = new List<number>()

        for (let i = 0; i < 100; i++) {
            instance.append(i)
            assert.strictEqual(instance.size(), i + 1)
        }
    })

    it('should correctly update `size` on `remove`', (): void => {
        const instance = new List<number>()

        instance.append(0)
        assert.strictEqual(instance.size(), 1)
        assert.strictEqual(instance.remove(), 0)
        assert.strictEqual(instance.size(), 0)
    })

    it('should return `null` if there are no entries', (): void => {
        const instance = new List<undefined>()

        assert.strictEqual(instance.remove(), null)
        assert.strictEqual(instance.peek(), null)
    })

    it('should work in FIFO order', (): void => {
        const instance = new List<number>()

        for (let i = 0; i < 5; i++) {
            instance.append(i)
            assert.strictEqual(instance.peek(), 0)
        }

        for (let i = 0; i < 5; i++) {
            assert.strictEqual(instance.remove(), i)
        }
    })
})
