import lcovParser from './promise/index.js'

/**
 * An asynchronous LCOV parser, which will return a `Promise` with the parsed sections.
 * This is simply an alias for "<package>/promise".
 *
 * If you want to use a stream instead, consider importing "<package>/stream".
 */
export default lcovParser
