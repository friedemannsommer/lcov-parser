import { expect } from 'chai'

import { Variant } from '../constants.js'
import { isEmptyField, isNonEmptyField } from '../lib/field-variant.js'

const variants: Variant[] = [
    Variant.None,
    Variant.BranchHit,
    Variant.BranchInstrumented,
    Variant.BranchLocation,
    Variant.EndOfRecord,
    Variant.FilePath,
    Variant.FunctionExecution,
    Variant.FunctionHit,
    Variant.FunctionInstrumented,
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
            expect(isEmptyField(variant)).to.eq(variant === Variant.EndOfRecord)
        })
    }
})

describe('field variant - isNonEmptyField', (): void => {
    for (const variant of variants) {
        it(`should correctly identify variant "${Variant[variant]}"`, (): void => {
            expect(isNonEmptyField(variant)).to.eq(variant !== Variant.EndOfRecord)
        })
    }
})
