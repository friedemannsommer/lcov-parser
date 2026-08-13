import { defaultFieldNames } from '../dist/constants.mjs'
import { LcovParser } from '../dist/parser.mjs'

export function fuzz(data) {
    const parser = new LcovParser(defaultFieldNames)

    parser.write(Buffer.from(data))
    parser.flush()
}
