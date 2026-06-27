import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { Variant } from '../constants.js'
import { isEmptyField, isNonEmptyField } from '../lib/field-variant.js'

const variants: Variant[] = [
    Variant.None,
    Variant.BranchHit,
    Variant.BranchInstrumented,
    Variant.BranchLocation,
    Variant.EndOfRecord,
    Variant.FilePath,
    Variant.FunctionAlias,
    Variant.FunctionExecution,
    Variant.FunctionHit,
    Variant.FunctionInstrumented,
    Variant.FunctionLeader,
    Variant.FunctionLocation,
    Variant.LineHit,
    Variant.LineInstrumented,
    Variant.LineLocation,
    Variant.TestName,
    Variant.Version
]

describe('field variant - isEmptyField', (): void => {
    for (const variant of variants) {
        it(`should correctly identify variant "${Variant[variant]}"`, (): void => {
            assert.strictEqual(isEmptyField(variant), variant === Variant.EndOfRecord || variant === Variant.None)
        })
    }
})

describe('field variant - isNonEmptyField', (): void => {
    for (const variant of variants) {
        it(`should correctly identify variant "${Variant[variant]}"`, (): void => {
            assert.strictEqual(isNonEmptyField(variant), variant !== Variant.EndOfRecord && variant !== Variant.None)
        })
    }
})
