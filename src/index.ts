import lcovParser from './promise/index.js'

export { BranchEntry, LineEntry, SectionSummary, Summary, FunctionEntry } from './typings/file.js'

/**
 * An asynchronous LCOV parser, which will return a `Promise` with the parsed sections.
 * This is simply an alias for "<package>/promise".
 *
 * If you want to use a stream instead, consider importing "<package>/stream".
 */
export default lcovParser

export { lcovParser }
