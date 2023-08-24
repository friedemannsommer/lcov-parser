import { expect } from 'chai'

import { defaultFieldNames, Variant } from '../constants.js'
import ByteMatch from '../lib/byte-match.js'
import { generateFieldLookup, LookupResult, mapFieldName, mapFieldNames, sortFieldNames } from '../lib/lookup.js'
import { FieldNames } from '../typings/options.js'

const fieldVariants: Array<[Variant, keyof FieldNames]> = [
    [Variant.BranchHit, 'branchHit'],
    [Variant.BranchInstrumented, 'branchInstrumented'],
    [Variant.BranchLocation, 'branchLocation'],
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

describe('Lookup - mapFieldNames', (): void => {
    it('should map all known fields to valid variants', (): void => {
        expect(mapFieldNames(fieldVariants.map(([, fieldName]) => fieldName))).to.eql(
            fieldVariants.map(([variant]) => variant)
        )
    })
})

describe('Lookup - mapFieldName', (): void => {
    for (const [variant, fieldName] of fieldVariants) {
        it(`should map field "${fieldName}" to "${Variant[variant]}"`, (): void => {
            expect(mapFieldName(fieldName)).to.eq(variant)
        })
    }
})

describe('Lookup - sortFieldNames', (): void => {
    it('should sort by value size (DESC)', (): void => {
        const value_1 = new ByteMatch([0])
        const value_2 = new ByteMatch([0, 1])
        const value_3 = new ByteMatch([0, 1, 2])

        expect(sortFieldNames([Variant.None, Variant.TestName, Variant.Version], [value_1, value_3, value_2])).to.eql([
            [Variant.TestName, Variant.Version, Variant.None],
            [value_3, value_2, value_1]
        ])
    })

    it('sort should be stable by value size (DESC)', (): void => {
        const value_3_a = new ByteMatch([0, 1, 2])
        const value_3_b = new ByteMatch([0, 1, 2])
        const value_3_c = new ByteMatch([0, 1, 2])

        expect(
            sortFieldNames([Variant.None, Variant.TestName, Variant.Version], [value_3_a, value_3_c, value_3_b])
        ).to.eql([
            [Variant.None, Variant.TestName, Variant.Version],
            [value_3_c, value_3_b, value_3_a]
        ])
    })
})

describe('Lookup - generateFieldLookup', (): void => {
    it('should generate field lookup with default fields', (): void => {
        const expected: Array<[Variant, ByteMatch]> = [
            [Variant.BranchHit, new ByteMatch([66, 82, 72])],
            [Variant.BranchInstrumented, new ByteMatch([66, 82, 70])],
            [Variant.BranchLocation, new ByteMatch([66, 82, 68, 65])],
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
            expected.reduce(
                (prev, [variant, matcher]) => {
                    prev[0].push(variant)
                    prev[1].push(matcher)

                    return prev
                },
                [[], []] as LookupResult
            )
        )
    })
})
