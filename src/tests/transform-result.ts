import { expect } from 'chai'

import { Variant } from '../constants.js'
import transformResult, {
    intoNone,
    transformBranchLocation,
    transformEndOfRecord,
    transformFilePath,
    transformFunctionExecution,
    transformFunctionLocation,
    transformHit,
    transformInstrumented,
    transformLineLocation,
    transformTestName,
    transformVersion
} from '../lib/transform-result.js'
import { ParseResult } from '../parser.js'
import {
    BranchLocationEntry,
    EndOfRecordEntry,
    Entry,
    EntryVariants,
    FilePathEntry,
    FunctionExecutionEntry,
    FunctionLocationEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineLocationEntry,
    NoneEntry,
    TestNameEntry,
    VersionEntry
} from '../typings/entry.js'

type TestData<V extends Variant, E extends Entry<V>> = Array<[ParseResult<V>, E]>
type TransformFn<V extends Variant, E extends Entry<V>> = (result: ParseResult<V>) => E

function processTestData<V extends Variant, E extends Entry<V>>(
    testData: TestData<V, E>,
    transformFn: TransformFn<V, E>
): void {
    for (let index = 0; index < testData.length; index++) {
        const [result, expected] = testData[index]

        it(`should parse (${Variant[result.variant]}) result with "done: ${result.done}" and value ${
            result.value ? 'length: ' + result.value.length : '"null"'
        } #${index + 1}`, (): void => {
            expect(transformFn(result)).to.eql(expected)
        })
    }
}

describe('intoNone', (): void => {
    const testData: TestData<Variant, NoneEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.BranchHit
            },
            {
                done: false,
                incomplete: false,
                variant: Variant.None
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: null,
                variant: Variant.BranchHit
            },
            {
                done: false,
                incomplete: true,
                variant: Variant.None
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: null,
                variant: Variant.BranchHit
            },
            {
                done: true,
                incomplete: true,
                variant: Variant.None
            }
        ]
    ]

    processTestData(testData, intoNone)
})

describe('transformHit', (): void => {
    const testData: TestData<Variant.BranchHit | Variant.FunctionHit | Variant.LineHit, HitEntryVariants> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.BranchHit
            },
            {
                done: false,
                hit: 0,
                variant: Variant.BranchHit
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FunctionHit
            },
            {
                done: true,
                hit: 0,
                variant: Variant.FunctionHit
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FunctionHit
            },
            {
                done: true,
                hit: 0,
                variant: Variant.FunctionHit
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: ['123'],
                variant: Variant.LineHit
            },
            {
                done: true,
                hit: 123,
                variant: Variant.LineHit
            }
        ]
    ]

    processTestData(testData, transformHit)
})

describe('transformInstrumented', (): void => {
    const testData: TestData<
        Variant.BranchInstrumented | Variant.FunctionInstrumented | Variant.LineInstrumented,
        InstrumentedEntryVariants
    > = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.BranchInstrumented
            },
            {
                done: false,
                found: 0,
                variant: Variant.BranchInstrumented
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FunctionInstrumented
            },
            {
                done: true,
                found: 0,
                variant: Variant.FunctionInstrumented
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: ['123'],
                variant: Variant.LineInstrumented
            },
            {
                done: true,
                found: 123,
                variant: Variant.LineInstrumented
            }
        ]
    ]

    processTestData(testData, transformInstrumented)
})

describe('transformBranchLocation', (): void => {
    const testData: TestData<Variant.BranchLocation, BranchLocationEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.BranchLocation
            },
            {
                block: 0,
                done: false,
                expression: '',
                isException: false,
                lineNumber: 0,
                taken: 0,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.BranchLocation
            },
            {
                block: 0,
                done: true,
                expression: '',
                isException: false,
                lineNumber: 0,
                taken: 0,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: [],
                variant: Variant.BranchLocation
            },
            {
                block: 0,
                done: false,
                expression: '',
                isException: false,
                lineNumber: 0,
                taken: 0,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', '2', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 0,
                done: false,
                expression: '',
                isException: false,
                lineNumber: 0,
                taken: 0,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', '2', 'expr', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                expression: 'expr',
                isException: false,
                lineNumber: 1,
                taken: 3,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', 'e2', 'expr', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                expression: 'expr',
                isException: true,
                lineNumber: 1,
                taken: 3,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', '2', 'expr', 'with', 'comma', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                expression: 'expr,with,comma',
                isException: true,
                lineNumber: 1,
                taken: 3,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', 'e2', 'expr', 'with', 'comma', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                expression: 'expr,with,comma',
                isException: true,
                lineNumber: 1,
                taken: 3,
                variant: Variant.BranchLocation
            }
        ]
    ]

    processTestData(testData, transformBranchLocation)
})

describe('transformEndOfRecord', (): void => {
    const testData: TestData<Variant.EndOfRecord, EndOfRecordEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.EndOfRecord
            },
            {
                done: false,
                variant: Variant.EndOfRecord
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: null,
                variant: Variant.EndOfRecord
            },
            {
                done: false,
                variant: Variant.EndOfRecord
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: null,
                variant: Variant.EndOfRecord
            },
            {
                done: true,
                variant: Variant.EndOfRecord
            }
        ]
    ]

    processTestData(testData, transformEndOfRecord)
})

describe('transformFilePath', (): void => {
    const testData: TestData<Variant.FilePath, FilePathEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.FilePath
            },
            {
                done: false,
                path: '',
                variant: Variant.FilePath
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FilePath
            },
            {
                done: true,
                path: '',
                variant: Variant.FilePath
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['test.file'],
                variant: Variant.FilePath
            },
            {
                done: false,
                path: 'test.file',
                variant: Variant.FilePath
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['test', 'file'],
                variant: Variant.FilePath
            },
            {
                done: true,
                path: 'test,file',
                variant: Variant.FilePath
            }
        ]
    ]

    processTestData(testData, transformFilePath)
})

describe('transformFunctionExecution', (): void => {
    const testData: TestData<Variant.FunctionExecution, FunctionExecutionEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.FunctionExecution
            },
            {
                called: 0,
                done: false,
                name: '',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: [],
                variant: Variant.FunctionExecution
            },
            {
                called: 0,
                done: false,
                name: '',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: ['1'],
                variant: Variant.FunctionExecution
            },
            {
                called: 0,
                done: true,
                name: '',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', 'test'],
                variant: Variant.FunctionExecution
            },
            {
                called: 1,
                done: true,
                name: 'test',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['NaN', 'n'],
                variant: Variant.FunctionExecution
            },
            {
                called: 0,
                done: false,
                name: 'n',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['11', 'shouldBeFine', 'this', 'should', 'not', 'be', 'used'],
                variant: Variant.FunctionExecution
            },
            {
                called: 11,
                done: true,
                name: 'shouldBeFine',
                variant: Variant.FunctionExecution
            }
        ]
    ]

    processTestData(testData, transformFunctionExecution)
})

describe('transformFunctionLocation', (): void => {
    const testData: TestData<Variant.FunctionLocation, FunctionLocationEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.FunctionLocation
            },
            {
                done: false,
                lineNumberEnd: 0,
                lineNumberStart: 0,
                name: '',
                variant: Variant.FunctionLocation
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FunctionLocation
            },
            {
                done: true,
                lineNumberEnd: 0,
                lineNumberStart: 0,
                name: '',
                variant: Variant.FunctionLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1'],
                variant: Variant.FunctionLocation
            },
            {
                done: false,
                lineNumberEnd: 0,
                lineNumberStart: 0,
                name: '',
                variant: Variant.FunctionLocation
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', 'name'],
                variant: Variant.FunctionLocation
            },
            {
                done: true,
                lineNumberEnd: 0,
                lineNumberStart: 1,
                name: 'name',
                variant: Variant.FunctionLocation
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '2', 'name'],
                variant: Variant.FunctionLocation
            },
            {
                done: false,
                lineNumberEnd: 2,
                lineNumberStart: 1,
                name: 'name',
                variant: Variant.FunctionLocation
            }
        ]
    ]

    processTestData(testData, transformFunctionLocation)
})

describe('transformLineLocation', (): void => {
    const testData: TestData<Variant.LineLocation, LineLocationEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.LineLocation
            },
            {
                checksum: '',
                done: false,
                hit: 0,
                lineNumber: 0,
                variant: Variant.LineLocation
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.LineLocation
            },
            {
                checksum: '',
                done: true,
                hit: 0,
                lineNumber: 0,
                variant: Variant.LineLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1'],
                variant: Variant.LineLocation
            },
            {
                checksum: '',
                done: false,
                hit: 0,
                lineNumber: 0,
                variant: Variant.LineLocation
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', '2'],
                variant: Variant.LineLocation
            },
            {
                checksum: '',
                done: true,
                hit: 2,
                lineNumber: 1,
                variant: Variant.LineLocation
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '2', 'md5'],
                variant: Variant.LineLocation
            },
            {
                checksum: 'md5',
                done: false,
                hit: 2,
                lineNumber: 1,
                variant: Variant.LineLocation
            }
        ]
    ]

    processTestData(testData, transformLineLocation)
})

describe('transformTestName', (): void => {
    const testData: TestData<Variant.TestName, TestNameEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.TestName
            },
            {
                done: false,
                name: '',
                variant: Variant.TestName
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.TestName
            },
            {
                done: true,
                name: '',
                variant: Variant.TestName
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['name'],
                variant: Variant.TestName
            },
            {
                done: false,
                name: 'name',
                variant: Variant.TestName
            }
        ]
    ]

    processTestData(testData, transformTestName)
})

describe('transformVersion', (): void => {
    const testData: TestData<Variant.Version, VersionEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.Version
            },
            {
                done: false,
                variant: Variant.Version,
                version: ''
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.Version
            },
            {
                done: true,
                variant: Variant.Version,
                version: ''
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1'],
                variant: Variant.Version
            },
            {
                done: false,
                variant: Variant.Version,
                version: '1'
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1.0'],
                variant: Variant.Version
            },
            {
                done: true,
                variant: Variant.Version,
                version: '1.0'
            }
        ]
    ]

    processTestData(testData, transformVersion)
})

describe('transformResult', (): void => {
    const testData: TestData<Variant, EntryVariants> = [
        [
            {
                done: false,
                incomplete: true,
                value: ['1.0'],
                variant: Variant.Version
            },
            {
                done: false,
                incomplete: true,
                variant: Variant.None
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: null,
                variant: Variant.EndOfRecord
            },
            {
                done: true,
                incomplete: true,
                variant: Variant.None
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.None
            },
            {
                done: false,
                incomplete: false,
                variant: Variant.None
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1'],
                variant: Variant.BranchHit
            },
            {
                done: false,
                hit: 1,
                variant: Variant.BranchHit
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['2'],
                variant: Variant.FunctionHit
            },
            {
                done: false,
                hit: 2,
                variant: Variant.FunctionHit
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['3'],
                variant: Variant.LineHit
            },
            {
                done: false,
                hit: 3,
                variant: Variant.LineHit
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1'],
                variant: Variant.BranchInstrumented
            },
            {
                done: false,
                found: 1,
                variant: Variant.BranchInstrumented
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['2'],
                variant: Variant.FunctionInstrumented
            },
            {
                done: false,
                found: 2,
                variant: Variant.FunctionInstrumented
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['3'],
                variant: Variant.LineInstrumented
            },
            {
                done: false,
                found: 3,
                variant: Variant.LineInstrumented
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', 'e2', 'separated', 'expr', '3'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                expression: 'separated,expr',
                isException: true,
                lineNumber: 1,
                taken: 3,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.EndOfRecord
            },
            {
                done: false,
                variant: Variant.EndOfRecord
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['path/to/file.ext'],
                variant: Variant.FilePath
            },
            {
                done: false,
                path: 'path/to/file.ext',
                variant: Variant.FilePath
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', 'fnName'],
                variant: Variant.FunctionExecution
            },
            {
                called: 1,
                done: false,
                name: 'fnName',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '2', 'fnName'],
                variant: Variant.FunctionLocation
            },
            {
                done: false,
                lineNumberEnd: 2,
                lineNumberStart: 1,
                name: 'fnName',
                variant: Variant.FunctionLocation
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '2', 'md5'],
                variant: Variant.LineLocation
            },
            {
                checksum: 'md5',
                done: false,
                hit: 2,
                lineNumber: 1,
                variant: Variant.LineLocation
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['name'],
                variant: Variant.TestName
            },
            {
                done: false,
                name: 'name',
                variant: Variant.TestName
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1.0'],
                variant: Variant.Version
            },
            {
                done: false,
                version: '1.0',
                variant: Variant.Version
            }
        ]
    ]

    processTestData(testData, transformResult)
})
