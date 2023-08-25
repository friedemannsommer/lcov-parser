import type { Readable, TransformOptions } from 'node:stream'

import { LcovParser } from '../parser.js'

export interface Options {
    fieldNames?: FieldNames
    from: string | Readable | Buffer | ArrayBuffer
    parser?: LcovParser
}

export interface StreamOptions
    extends Omit<TransformOptions, 'transform' | 'flush' | 'writableObjectMode' | 'readableObjectMode'> {
    fieldNames?: FieldNames
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
