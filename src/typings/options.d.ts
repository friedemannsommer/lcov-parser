import type { Readable } from 'node:stream'

import { LcovParser } from '../parser.js'

export interface Options {
    fieldNames?: FieldNames
    from: string | Readable | Buffer | ArrayBuffer
    parser?: LcovParser
}

export interface FieldNames {
    branchHit: string
    branchInstrumented: string
    branchLocation: string
    endOfRecord: string
    filePath: string
    functionExecution: string
    functionHit: string
    functionInstrumented: string
    functionLocation: string
    lineHit: string
    lineInstrumented: string
    lineLocation: string
    testName: string
    version: string
}
