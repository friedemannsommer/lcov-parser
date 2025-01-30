import { defaultFieldNames } from '../constants.js'
import { transformSynchronous } from '../lib/transform-flow.js'
import { LcovParser } from '../parser.js'
import type { SectionSummary } from '../typings/file.js'
import type { SyncOptions } from '../typings/options.js'

/**
 * Tries to parse the given input (passed by {@link SyncOptions#from}) into sections.
 *
 * @param options - The parse options must include the {@link SyncOptions#from} field.
 */
export function lcovParser(options: SyncOptions): SectionSummary[] {
    const { fieldNames, from, parser } = options
    const parserInstance = parser ?? new LcovParser(fieldNames ?? defaultFieldNames)

    if (typeof from === 'string' || from instanceof ArrayBuffer) {
        parserInstance.write(Buffer.from(from as ArrayBuffer))

        return transformSynchronous(parserInstance.flush())
    }

    if (Buffer.isBuffer(from)) {
        parserInstance.write(from)

        return transformSynchronous(parserInstance.flush())
    }

    throw new Error("given `from` type isn't supported.")
}

export type { SyncOptions as Options }

export default lcovParser
