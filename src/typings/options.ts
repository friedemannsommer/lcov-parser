import type { Readable, TransformOptions } from 'node:stream'

import { LcovParser } from '../parser.js'

export interface Options {
    /**
     * The field names to use for parsing. These will only be used if {@link Options#parser} is not present.
     */
    fieldNames?: FieldNames
    /**
     * Input source to read from.
     * This can be a `string`, [Readable](https://nodejs.org/api/stream.html#readable-streams), `Buffer`, or `ArrayBuffer`.
     */
    from: string | Readable | Buffer | ArrayBuffer
    /**
     * A parser instance that should be used for parsing, instead of creating a new one internally.
     */
    parser?: LcovParser
}

export interface StreamOptions
    extends Omit<TransformOptions, 'transform' | 'flush' | 'writableObjectMode' | 'readableObjectMode'> {
    /**
     * The field names to use for parsing. These will only be used if {@link StreamOptions#parser} is not present.
     */
    fieldNames?: FieldNames
    /**
     * A parser instance that should be used for parsing, instead of creating a new one internally.
     */
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
