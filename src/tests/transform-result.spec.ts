import { expect } from 'chai'

import { Variant } from '../constants.js'
import transformResult, {
    intoNone,
    transformBranchLocation,
    transformComment,
    transformEndOfRecord,
    transformFilePath,
    transformFunctionAlias,
    transformFunctionExecution,
    transformFunctionLeader,
    transformFunctionLocation,
    transformHit,
    transformInstrumented,
    transformLineLocation,
    transformTestName,
    transformVersion
} from '../lib/transform-result.js'
import type { ParseResult } from '../parser.js'
import type {
    BranchLocationEntry,
    CommentEntry,
    EndOfRecordEntry,
    Entry,
    EntryVariants,
    FilePathEntry,
    FunctionAliasEntry,
    FunctionExecutionEntry,
    FunctionLeaderEntry,
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
            result.value ? `length: ${result.value.length}` : '"null"'
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
                branch: '',
                isException: false,
                line: 0,
                hit: 0,
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
                branch: '',
                isException: false,
                line: 0,
                hit: 0,
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
                branch: '',
                isException: false,
                line: 0,
                hit: 0,
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
                branch: '',
                isException: false,
                line: 0,
                hit: 0,
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
                branch: 'expr',
                isException: false,
                line: 1,
                hit: 3,
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
                branch: 'expr',
                isException: true,
                line: 1,
                hit: 3,
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
                branch: 'expr,with,comma',
                isException: false,
                line: 1,
                hit: 3,
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
                branch: 'expr,with,comma',
                isException: true,
                line: 1,
                hit: 3,
                variant: Variant.BranchLocation
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1', '2', 'expr', '-'],
                variant: Variant.BranchLocation
            },
            {
                block: 2,
                done: false,
                branch: 'expr',
                isException: false,
                line: 1,
                hit: 0,
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
                hit: 0,
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
                hit: 0,
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
                hit: 0,
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
                hit: 1,
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
                hit: 0,
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
                hit: 11,
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
                lineEnd: 0,
                lineStart: 0,
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
                lineEnd: 0,
                lineStart: 0,
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
                lineEnd: 0,
                lineStart: 0,
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
                lineEnd: 0,
                lineStart: 1,
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
                lineEnd: 2,
                lineStart: 1,
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
                line: 0,
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
                line: 0,
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
                line: 0,
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
                line: 1,
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
                line: 1,
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
                branch: 'separated,expr',
                isException: true,
                line: 1,
                hit: 3,
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
                value: ['1', '10', 'fnName'],
                variant: Variant.FunctionAlias
            },
            {
                done: false,
                index: 1,
                hit: 10,
                name: 'fnName',
                variant: Variant.FunctionAlias
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
                hit: 1,
                done: false,
                name: 'fnName',
                variant: Variant.FunctionExecution
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '10', '12'],
                variant: Variant.FunctionLeader
            },
            {
                done: false,
                index: 1,
                lineStart: 10,
                lineEnd: 12,
                aliases: [],
                variant: Variant.FunctionLeader
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
                lineEnd: 2,
                lineStart: 1,
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
                line: 1,
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
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['hello world'],
                variant: Variant.Comment
            },
            {
                comment: 'hello world',
                done: false,
                variant: Variant.Comment
            }
        ]
    ]

    processTestData(testData, transformResult)
})

describe('transformComment', (): void => {
    const testData: TestData<Variant.Comment, CommentEntry> = [
        [
            {
                done: false,
                incomplete: false,
                value: null,
                variant: Variant.Comment
            },
            {
                comment: '',
                done: false,
                variant: Variant.Comment
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.Comment
            },
            {
                comment: '',
                done: true,
                variant: Variant.Comment
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1 2 3'],
                variant: Variant.Comment
            },
            {
                comment: '1 2 3',
                done: false,
                variant: Variant.Comment
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '2', '3'],
                variant: Variant.Comment
            },
            {
                comment: '1,2,3',
                done: false,
                variant: Variant.Comment
            }
        ]
    ]

    processTestData(testData, transformComment)
})

describe('transformFunctionAlias', (): void => {
    const testData: TestData<Variant.FunctionAlias, FunctionAliasEntry> = [
        [
            {
                done: false,
                incomplete: true,
                value: [],
                variant: Variant.FunctionAlias
            },
            {
                hit: 0,
                done: false,
                index: 0,
                name: '',
                variant: Variant.FunctionAlias
            }
        ],
        [
            {
                done: true,
                incomplete: false,
                value: ['1'],
                variant: Variant.FunctionAlias
            },
            {
                hit: 0,
                done: true,
                index: 0,
                name: '',
                variant: Variant.FunctionAlias
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', '10'],
                variant: Variant.FunctionAlias
            },
            {
                hit: 0,
                done: true,
                index: 0,
                name: '',
                variant: Variant.FunctionAlias
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', '10', 'test'],
                variant: Variant.FunctionAlias
            },
            {
                hit: 10,
                done: true,
                index: 1,
                name: 'test',
                variant: Variant.FunctionAlias
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['NaN', 'NaN', 'n'],
                variant: Variant.FunctionAlias
            },
            {
                hit: 0,
                done: false,
                index: 0,
                name: 'n',
                variant: Variant.FunctionAlias
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['2', '11', 'shouldBeFine', 'this', 'should', 'not', 'be', 'used'],
                variant: Variant.FunctionAlias
            },
            {
                hit: 11,
                done: true,
                index: 2,
                name: 'shouldBeFine',
                variant: Variant.FunctionAlias
            }
        ]
    ]

    processTestData(testData, transformFunctionAlias)
})

describe('transformFunctionLeader', (): void => {
    const testData: TestData<Variant.FunctionLeader, FunctionLeaderEntry> = [
        [
            {
                done: true,
                incomplete: false,
                value: [],
                variant: Variant.FunctionLeader
            },
            {
                done: true,
                index: 0,
                lineEnd: 0,
                lineStart: 0,
                aliases: [],
                variant: Variant.FunctionLeader
            }
        ],
        [
            {
                done: false,
                incomplete: true,
                value: ['1'],
                variant: Variant.FunctionLeader
            },
            {
                done: false,
                index: 0,
                lineEnd: 0,
                lineStart: 0,
                aliases: [],
                variant: Variant.FunctionLeader
            }
        ],
        [
            {
                done: true,
                incomplete: true,
                value: ['1', '1'],
                variant: Variant.FunctionLeader
            },
            {
                done: true,
                index: 1,
                lineEnd: 0,
                lineStart: 1,
                aliases: [],
                variant: Variant.FunctionLeader
            }
        ],
        [
            {
                done: false,
                incomplete: false,
                value: ['1', '1', '2'],
                variant: Variant.FunctionLeader
            },
            {
                done: false,
                index: 1,
                lineEnd: 2,
                lineStart: 1,
                aliases: [],
                variant: Variant.FunctionLeader
            }
        ]
    ]

    processTestData(testData, transformFunctionLeader)
})
