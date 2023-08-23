import type { Duplex, Readable, Stream, Writable } from 'node:stream'

export interface Options {
    from?: string | Stream | Readable | Writable | Duplex | Buffer | ArrayBuffer
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
}
