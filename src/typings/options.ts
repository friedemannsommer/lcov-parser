import type { Readable, TransformOptions } from 'node:stream'

import type { LcovParser } from '../parser.js'

export interface SharedOptions {
    /**
     * The field names to use for parsing. These will only be used if the `parser` field is not defined.
     */
    fieldNames?: FieldNames
    /**
     * A parser instance that should be used for parsing instead of creating a new one internally.
     */
    parser?: LcovParser
}

export interface Options extends SharedOptions {
    /**
     * Input source to read from.
     * This can be a `string`, [Readable](https://nodejs.org/api/stream.html#readable-streams), `Buffer`, or `ArrayBuffer`.
     */
    from: string | Readable | Buffer | ArrayBuffer
}

export interface SyncOptions extends SharedOptions {
    /**
     * Input source to read from.
     * This can be a `string`, `Buffer`, or `ArrayBuffer`.
     */
    from: string | Buffer | ArrayBuffer
}

export interface StreamOptions
    extends Omit<
        TransformOptions,
        'transform' | 'flush' | 'writableObjectMode' | 'readableObjectMode' | 'decodeStrings'
    > {
    /**
     * The field names to use for parsing. These will only be used if {@link StreamOptions#parser} is not present.
     */
    fieldNames?: FieldNames
    /**
     * A parser instance that should be used for parsing instead of creating a new one internally.
     */
    parser?: LcovParser
}

export interface FieldNames {
    branchHit: string
    branchInstrumented: string
    branchLocation: string
    comment: string
    endOfRecord: string
    filePath: string
    functionAlias: string
    functionExecution: string
    functionHit: string
    functionInstrumented: string
    functionLeader: string
    functionLocation: string
    lineHit: string
    lineInstrumented: string
    lineLocation: string
    testName: string
    version: string
}
