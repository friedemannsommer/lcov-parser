import lcovParser from './promise/index.js'

export type { BranchEntry, FunctionEntry, LineEntry, SectionSummary, Summary } from './typings/file.js'
export type { FieldNames } from './typings/options.js'

/**
 * An asynchronous LCOV parser, which will return a `Promise` with the parsed sections.
 * This is simply an alias for {@link lcovParser}.
 *
 * If you want to use a stream instead, consider importing {@link LcovStreamParser}.
 */
export default lcovParser

export { lcovParser }
