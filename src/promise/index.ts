import { Readable } from 'node:stream'

import { defaultFieldNames } from '../constants.js'
import { LcovParser } from '../parser.js'
import { SectionSummary } from '../typings/file.js'
import { Options } from '../typings/options.js'
import { transformAsynchronous, transformSynchronous } from './transform.js'

/**
 * Tries to parse the given input (passed by {@link Options#from}) into one or multiple sections.
 *
 * @param options - The parse options must include the {@link Options#from} field.
 */
export function lcovParser(options: Options): Promise<SectionSummary[]> {
    const { fieldNames, from, parser } = options
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

export { Options }

export default lcovParser
