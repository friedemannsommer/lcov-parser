import { fieldNames } from './lib/field-names.js'

/**
 * Field entry variants
 */
export enum Variant {
    /**
     * Used for {@link parser.ParseResult | incomplete} and {@link parser.ParseResult | done} results.
     */
    None,
    /**
     * Number of branches hit.
     */
    BranchHit,
    /**
     * Number of branches found.
     */
    BranchInstrumented,
    /**
     * Provides branch coverage information, such as line number, block ID, branch (expression), and how often it was used.
     */
    BranchLocation,
    /**
     * Signals the end of a section.
     */
    EndOfRecord,
    /**
     * The source file path.
     */
    FilePath,
    /**
     * Call count for a given function, identified by name.
     */
    FunctionExecution,
    /**
     * Number of functions hit.
     */
    FunctionHit,
    /**
     * Number of functions found.
     */
    FunctionInstrumented,
    /**
     * Start and end line numbers for a given function, identified by name.
     */
    FunctionLocation,
    /**
     * Number of lines with a non-zero execution count.
     */
    LineHit,
    /**
     * Number of instrumented lines.
     */
    LineInstrumented,
    /**
     * The execution count for a line, identified by line number.
     */
    LineLocation,
    /**
     * The test name.
     */
    TestName,
    /**
     * The source code version ID.
     */
    Version
}

/**
 * The default names as specified in the [linux-test-project/lcov/geninfo][1] description.
 *
 * [1]: https://github.com/linux-test-project/lcov/blob/3decc12ab1e7b34d2860393e2f40f0e1057d5c16/man/geninfo.1#L989-L1171
 */
export const defaultFieldNames = Object.freeze(fieldNames())
