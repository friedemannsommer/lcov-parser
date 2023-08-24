import { Readable } from 'node:stream'

import { defaultFieldNames } from '../constants.js'
import { LcovParser } from '../parser.js'
import { SectionSummary } from '../typings/file.js'
import { Options } from '../typings/options.js'
import { transformAsynchronous, transformSynchronous } from './transform.js'

/**
 * Tries to parse the given input (passed by `from`) into one or multiple sections.
 *
 * @param fieldNames - Field names to use while parsing. These will only be used if `parser` is not present.
 * @param from - The source from which the parser should read.
 * @param parser - A parser instance, which should be used instead of creating a new one.
 */
export default function lcovParser({ fieldNames, from, parser }: Options): Promise<SectionSummary[]> {
    const parserInstance = parser ?? new LcovParser(fieldNames ?? defaultFieldNames)

    if (from instanceof Readable) {
        return transformAsynchronous(parserInstance, from)
    }

    if (typeof from === 'string' || from instanceof ArrayBuffer) {
        parserInstance.write(Buffer.from(from as ArrayBuffer))

        return new Promise((res): void => {
            res(transformSynchronous(parserInstance.flush()))
        })
    }

    if (Buffer.isBuffer(from)) {
        parserInstance.write(from)

        return new Promise((res): void => {
            res(transformSynchronous(parserInstance.flush()))
        })
    }

    return Promise.reject(new Error("given `from` type isn't supported."))
}
