import { expect } from 'chai'

import { Variant, defaultFieldNames } from '../constants.js'
import ByteMatch from '../lib/byte-match.js'
import { FIELD_NAME_MAP, type FieldOptions, generateFieldLookup, sortFieldNames } from '../lib/lookup.js'
import type { FieldNames } from '../typings/options.js'

const fieldVariants: Array<[Variant, keyof FieldNames]> = [
    [Variant.BranchHit, 'branchHit'],
    [Variant.BranchInstrumented, 'branchInstrumented'],
    [Variant.BranchLocation, 'branchLocation'],
    [Variant.Comment, 'comment'],
    [Variant.EndOfRecord, 'endOfRecord'],
    [Variant.FilePath, 'filePath'],
    [Variant.FunctionExecution, 'functionExecution'],
    [Variant.FunctionHit, 'functionHit'],
    [Variant.FunctionInstrumented, 'functionInstrumented'],
    [Variant.FunctionLocation, 'functionLocation'],
    [Variant.LineHit, 'lineHit'],
    [Variant.LineInstrumented, 'lineInstrumented'],
    [Variant.LineLocation, 'lineLocation'],
    [Variant.TestName, 'testName'],
    [Variant.Version, 'version']
]

describe('Lookup - mapFieldName', (): void => {
    for (const [variant, fieldName] of fieldVariants) {
        it(`should map field "${fieldName}" to "${Variant[variant]}"`, (): void => {
            expect(FIELD_NAME_MAP[fieldName]).to.eq(variant)
        })
    }
})

describe('Lookup - sortFieldNames', (): void => {
    it('should sort by value size (DESC)', (): void => {
        expect(
            sortFieldNames(
                { variant: Variant.Comment, matcher: new ByteMatch([0]) },
                { variant: Variant.Comment, matcher: new ByteMatch([1]) }
            )
        ).to.eq(0)

        expect(
            sortFieldNames(
                { variant: Variant.Comment, matcher: new ByteMatch([0]) },
                { variant: Variant.Comment, matcher: new ByteMatch([0, 1]) }
            )
        ).to.greaterThan(0)

        expect(
            sortFieldNames(
                { variant: Variant.Comment, matcher: new ByteMatch([0, 1]) },
                { variant: Variant.Comment, matcher: new ByteMatch([0]) }
            )
        ).to.lessThan(0)
    })
})

describe('Lookup - generateFieldLookup', (): void => {
    it('should generate field lookup with default fields', (): void => {
        const expected: Array<[Variant, ByteMatch]> = [
            [Variant.BranchHit, new ByteMatch([66, 82, 72])],
            [Variant.BranchInstrumented, new ByteMatch([66, 82, 70])],
            [Variant.BranchLocation, new ByteMatch([66, 82, 68, 65])],
            [Variant.Comment, new ByteMatch([35])],
            [Variant.EndOfRecord, new ByteMatch([101, 110, 100, 95, 111, 102, 95, 114, 101, 99, 111, 114, 100])],
            [Variant.FilePath, new ByteMatch([83, 70])],
            [Variant.FunctionExecution, new ByteMatch([70, 78, 68, 65])],
            [Variant.FunctionHit, new ByteMatch([70, 78, 72])],
            [Variant.FunctionInstrumented, new ByteMatch([70, 78, 70])],
            [Variant.FunctionLocation, new ByteMatch([70, 78])],
            [Variant.LineHit, new ByteMatch([76, 72])],
            [Variant.LineInstrumented, new ByteMatch([76, 70])],
            [Variant.LineLocation, new ByteMatch([68, 65])],
            [Variant.TestName, new ByteMatch([84, 78])],
            [Variant.Version, new ByteMatch([86, 69, 82])]
        ]

        expected.sort(([, matcherA], [, matcherB]) => (matcherA.size > matcherB.size ? -1 : 1))

        expect(generateFieldLookup(defaultFieldNames)).to.eql(
            expected.map(
                ([variant, matcher]): FieldOptions => ({
                    variant,
                    matcher
                })
            )
        )
    })
})
