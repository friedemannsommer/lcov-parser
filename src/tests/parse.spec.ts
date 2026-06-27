import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseInteger } from '../lib/parse.js'

describe('parseInteger', (): void => {
    it('should parse valid single digit input', (): void => {
        assert.strictEqual(parseInteger('1'), 1)
    })

    it('should parse valid multi digit input', (): void => {
        assert.strictEqual(parseInteger('1111111'), 1111111)
    })

    it('should fallback to `0` if given a invalid value', (): void => {
        assert.strictEqual(parseInteger('e'), 0)
    })
})
