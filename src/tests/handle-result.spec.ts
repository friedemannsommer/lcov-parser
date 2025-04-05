import { expect } from 'chai'

import { Variant } from '../constants.js'
import {
    type FunctionLeaders,
    type FunctionMap,
    createBranchSummary,
    createFunctionSummary,
    createLineSummary,
    createSection,
    createUpdateFunctionSummary,
    handleResult,
    updateResults,
    updateSectionSummary
} from '../lib/handle-result.js'
import type {
    BranchHitEntry,
    BranchInstrumentedEntry,
    BranchLocationEntry,
    EntryVariants,
    FunctionHitEntry,
    FunctionInstrumentedEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineHitEntry,
    LineInstrumentedEntry,
    LineLocationEntry
} from '../typings/entry.js'
import type { FunctionEntry, LineEntry, SectionSummary, Summary } from '../typings/file.js'
import {
    getBranchLocationEntry,
    getEndOfRecord,
    getFilePathEntry,
    getFunctionExecutionEntry,
    getFunctionLocationEntry,
    getHitEntry,
    getInstrumentedEntry,
    getLineLocationEntry,
    getTestNameEntry
} from './lib/entry.js'

describe('createSection', (): void => {
    it('default section structure with empty string as name', (): void => {
        expect(createSection()).to.eql({
            branches: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            functions: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            lines: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            name: '',
            path: ''
        })
    })

    it('default section structure with given entry name', (): void => {
        expect(createSection(getTestNameEntry('test'))).to.eql({
            branches: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            functions: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            lines: {
                details: [],
                hit: 0,
                instrumented: 0
            },
            name: 'test',
            path: ''
        })
    })
})

describe('createBranchSummary', (): void => {
    it('should create summary with given entry values', (): void => {
        expect(createBranchSummary(getBranchLocationEntry(2, undefined, 4, true, 6))).to.eql({
            block: 2,
            branch: '_test_',
            hit: 4,
            isException: true,
            line: 6
        })
    })
})

describe('createFunctionSummary', (): void => {
    it('create with location entry', (): void => {
        expect(createFunctionSummary(getFunctionLocationEntry('_test_', 4))).to.eql({
            hit: 0,
            line: 4,
            name: '_test_'
        })
    })

    it('create with execution entry', (): void => {
        expect(createFunctionSummary(getFunctionExecutionEntry('_test_', 3))).to.eql({
            hit: 3,
            line: 0,
            name: '_test_'
        })
    })
})

describe('createLineSummary', (): void => {
    it('should create summary with given values', (): void => {
        expect(createLineSummary(getLineLocationEntry())).to.eql({
            hit: 2,
            line: 4
        })
    })
})

describe('updateSectionSummary', (): void => {
    const testData: Array<[Variant, number]> = [
        [Variant.BranchHit, 4],
        [Variant.FunctionHit, 6],
        [Variant.LineHit, 8],
        [Variant.BranchInstrumented, 10],
        [Variant.FunctionInstrumented, 12],
        [Variant.LineInstrumented, 14]
    ]

    for (const [variant, value] of testData) {
        const summary: Summary<LineEntry> = {
            details: [],
            hit: 0,
            instrumented: 0
        }
        const isHitVariant =
            variant === Variant.BranchHit || variant === Variant.FunctionHit || variant === Variant.LineHit
        const fieldName = isHitVariant ? 'hit' : 'found'

        it(`should update the "${fieldName}" field with the given value (${value}) for variant "${Variant[variant]}"`, (): void => {
            updateSectionSummary(summary, {
                [fieldName]: value,
                done: false,
                variant: variant
            } as unknown as HitEntryVariants | InstrumentedEntryVariants)

            expect(summary).to.eql({
                details: [],
                hit: isHitVariant ? value : 0,
                instrumented: isHitVariant ? 0 : value
            })
        })
    }
})

describe('createUpdateFunctionSummary', (): void => {
    const testData: Array<[string, Array<[Variant, number]>]> = [
        [
            'test_a',
            [
                [Variant.FunctionLocation, 4],
                [Variant.FunctionExecution, 2]
            ]
        ],
        [
            'test_b',
            [
                [Variant.FunctionExecution, 3],
                [Variant.FunctionLocation, 6]
            ]
        ],
        [
            'test_c',
            [
                [Variant.FunctionExecution, 3],
                [Variant.FunctionLocation, 6],
                [Variant.FunctionExecution, 2],
                [Variant.FunctionLocation, 5],
                [Variant.FunctionExecution, 1],
                [Variant.FunctionLocation, 4]
            ]
        ]
    ]
    const functionLeaders: FunctionLeaders = new Map()
    const functionMap: FunctionMap = new Map()
    const fnList: FunctionEntry[] = []

    for (const [name, entries] of testData) {
        for (const [variant, value] of entries) {
            createUpdateFunctionSummary(
                functionLeaders,
                functionMap,
                fnList,
                variant === Variant.FunctionLocation
                    ? getFunctionLocationEntry(name, value)
                    : getFunctionExecutionEntry(name, value)
            )
        }

        it(`should create function summary for "${name}" based on (${entries.length}) entries`, (): void => {
            expect(functionMap.get(name)).to.eql({
                hit: getSumByVariant(entries, Variant.FunctionExecution),
                line: getLastEntryValue(entries, Variant.FunctionLocation),
                name
            })
        })
    }

    it(`should have created (${testData.length}) entries with provided values`, (): void => {
        expect(fnList).to.eql(
            testData.map(([name, entries]) => ({
                hit: getSumByVariant(entries, Variant.FunctionExecution),
                line: getLastEntryValue(entries, Variant.FunctionLocation),
                name
            }))
        )
    })

    function getLastEntryValue(entries: Array<[Variant, number]>, expectedVariant: Variant): number {
        for (let index = entries.length - 1; index >= 0; index--) {
            const [variant, value] = entries[index]

            if (variant === expectedVariant) {
                return value
            }
        }

        return 0
    }

    function getSumByVariant(entries: Array<[Variant, number]>, expectedVariant: Variant): number {
        return entries.reduce(
            (previousValue, [variant, value]): number =>
                variant === expectedVariant ? previousValue + value : previousValue,
            0
        )
    }
})

describe('handleResult', (): void => {
    it('should update section name', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map([['a', createFunctionSummary(getFunctionExecutionEntry('a', 1))]])
        const section = createSection()

        expect(handleResult(getTestNameEntry('test'), functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0, 'should have cleared the functionMap')
        expect(section).to.eql({
            ...createSection(),
            name: 'test'
        })
    })

    it('should update section file path', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()

        expect(handleResult(getFilePathEntry('path/to/file.ext'), functionLeaders, functionMap, section)).to.be.false
        expect(section).to.eql({
            ...createSection(),
            path: 'path/to/file.ext'
        })
    })

    it('should clear function map and signal to create a new section', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map([['b', createFunctionSummary(getFunctionLocationEntry('b', 0))]])
        const section = createSection()

        expect(handleResult(getEndOfRecord(), functionLeaders, functionMap, section)).to.be.true
        expect(section).to.eql(createSection())
    })

    it(`should create function summary from "${Variant[Variant.FunctionLocation]}"`, (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const entry = getFunctionLocationEntry('test', 1)
        const section = createSection()
        const expectedSection = createSection()
        const expectedSummary = createFunctionSummary({ ...entry })

        expect(handleResult(entry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.get('test')).to.eql(expectedSummary)
        expect(section).to.eql({
            ...expectedSection,
            functions: {
                ...expectedSection.functions,
                details: [expectedSummary]
            }
        })
    })

    it(`should create function summary from "${Variant[Variant.FunctionExecution]}"`, (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const entry = getFunctionExecutionEntry('test', 2)
        const section = createSection()
        const expectedSection = createSection()
        const expectedSummary = createFunctionSummary({ ...entry })

        expect(handleResult(entry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.get('test')).to.eql(expectedSummary)
        expect(section).to.eql({
            ...expectedSection,
            functions: {
                ...expectedSection.functions,
                details: [expectedSummary]
            }
        })
    })

    it('should create and update function summary', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const locationEntry = getFunctionLocationEntry('test', 1)
        const executionEntry = getFunctionExecutionEntry('test', 2)
        const section = createSection()
        const expectedSection = createSection()
        const expectedSummary = createFunctionSummary({ ...locationEntry })

        expectedSummary.hit = 2

        expect(handleResult(locationEntry, functionLeaders, functionMap, section)).to.be.false
        expect(handleResult(executionEntry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.get('test')).to.eql(expectedSummary)
        expect(section).to.eql({
            ...expectedSection,
            functions: {
                ...expectedSection.functions,
                details: [expectedSummary]
            }
        })
    })

    it(`should create branch entry from "${Variant[Variant.BranchLocation]}"`, (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()
        const entry: BranchLocationEntry = getBranchLocationEntry()
        const expectedSection = createSection()
        const expectedSummary = createBranchSummary({ ...entry })

        expect(handleResult(entry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0)
        expect(section).to.eql({
            ...expectedSection,
            branches: {
                ...expectedSection.branches,
                details: [expectedSummary]
            }
        })
    })

    it(`should create line entry from "${Variant[Variant.LineLocation]}"`, (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()
        const entry: LineLocationEntry = getLineLocationEntry()
        const expectedSection = createSection()
        const expectedSummary = createLineSummary({ ...entry })

        expect(handleResult(entry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0)
        expect(section).to.eql({
            ...expectedSection,
            lines: {
                ...expectedSection.lines,
                details: [expectedSummary]
            }
        })
    })

    it('should update branch summary', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()
        const instrumentedEntry: BranchInstrumentedEntry = getInstrumentedEntry(Variant.BranchInstrumented, 2)
        const hitEntry: BranchHitEntry = getHitEntry(Variant.BranchHit, 4)

        expect(handleResult(instrumentedEntry, functionLeaders, functionMap, section)).to.be.false
        expect(handleResult(hitEntry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0)
        expect(section).to.eql({
            ...createSection(),
            branches: {
                details: [],
                hit: 4,
                instrumented: 2
            }
        })
    })

    it('should update function summary', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()
        const instrumentedEntry: FunctionInstrumentedEntry = getInstrumentedEntry(Variant.FunctionInstrumented, 2)
        const hitEntry: FunctionHitEntry = getHitEntry(Variant.FunctionHit, 4)

        expect(handleResult(instrumentedEntry, functionLeaders, functionMap, section)).to.be.false
        expect(handleResult(hitEntry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0)
        expect(section).to.eql({
            ...createSection(),
            functions: {
                details: [],
                hit: 4,
                instrumented: 2
            }
        })
    })

    it('should update line summary', (): void => {
        const functionLeaders: FunctionLeaders = new Map()
        const functionMap: FunctionMap = new Map()
        const section = createSection()
        const instrumentedEntry: LineInstrumentedEntry = getInstrumentedEntry(Variant.LineInstrumented, 2)
        const hitEntry: LineHitEntry = getHitEntry(Variant.LineHit, 4)

        expect(handleResult(instrumentedEntry, functionLeaders, functionMap, section)).to.be.false
        expect(handleResult(hitEntry, functionLeaders, functionMap, section)).to.be.false
        expect(functionMap.size).to.eq(0)
        expect(section).to.eql({
            ...createSection(),
            lines: {
                details: [],
                hit: 4,
                instrumented: 2
            }
        })
    })
})

describe('updateResults', (): void => {
    const testData: Array<[EntryVariants[], SectionSummary[]]> = [
        [
            [
                getTestNameEntry('example #1'),
                getFilePathEntry('path/to/file.ext'),
                getEndOfRecord(),
                getTestNameEntry('example #2'),
                getEndOfRecord(),
                getTestNameEntry('example #3'),
                getEndOfRecord()
            ],
            [
                {
                    ...createSection(getTestNameEntry('example #1')),
                    path: 'path/to/file.ext'
                },
                createSection(getTestNameEntry('example #2')),
                createSection(getTestNameEntry('example #3'))
            ]
        ],
        [[getFilePathEntry('example.file')], [{ ...createSection(), path: 'example.file' }]],
        [
            [
                getTestNameEntry('test'),
                getFilePathEntry('path/to/file.ext'),
                getFunctionLocationEntry('_test', 1),
                getFunctionExecutionEntry('_test', 2),
                getInstrumentedEntry(Variant.FunctionInstrumented, 1),
                getHitEntry(Variant.FunctionHit, 2),
                getLineLocationEntry(2, 2),
                getInstrumentedEntry(Variant.LineInstrumented, 2),
                getHitEntry(Variant.LineHit, 2),
                getBranchLocationEntry(1, '!a', 2, false, 2),
                getInstrumentedEntry(Variant.BranchInstrumented, 1),
                getHitEntry(Variant.BranchHit, 2),
                getEndOfRecord()
            ],
            [
                {
                    branches: {
                        details: [createBranchSummary(getBranchLocationEntry(1, '!a', 2, false, 2))],
                        hit: 2,
                        instrumented: 1
                    },
                    functions: {
                        details: [
                            {
                                ...createFunctionSummary(getFunctionLocationEntry('_test', 1)),
                                hit: 2
                            }
                        ],
                        hit: 2,
                        instrumented: 1
                    },
                    lines: {
                        details: [createLineSummary(getLineLocationEntry(2, 2))],
                        hit: 2,
                        instrumented: 2
                    },
                    name: 'test',
                    path: 'path/to/file.ext'
                }
            ]
        ]
    ]

    for (const [entries, expectedSections] of testData) {
        it(`should update sections based on values from (${entries.length}) entries`, (): void => {
            const functionLeaders: FunctionLeaders = new Map()
            const functionMap: FunctionMap = new Map()
            const sections: SectionSummary[] = []
            let sectionIndex = 0

            for (const entry of entries) {
                sectionIndex = updateResults(sectionIndex, entry, functionLeaders, functionMap, sections)
            }

            expect(sections).to.eql(expectedSections)
        })
    }
})
