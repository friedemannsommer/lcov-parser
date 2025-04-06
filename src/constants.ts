import { fieldNames } from './lib/field-names.js'

/**
 * Field entry variants
 */
export enum Variant {
    /**
     * Used for {@link parser.ParseResult#incomplete} and {@link parser.ParseResult#done} results.
     */
    None = 0,
    /**
     * Number of branches hit.
     */
    BranchHit = 1,
    /**
     * Number of branches found.
     */
    BranchInstrumented = 2,
    /**
     * Provides branch coverage information, such as line number, block ID, branch, and how often it was used.
     */
    BranchLocation = 3,
    /**
     * A comment string.
     */
    Comment = 4,
    /**
     * Signals the end of a section.
     */
    EndOfRecord = 5,
    /**
     * The source file path.
     */
    FilePath = 6,
    /**
     * Call count for a given function alias.
     */
    FunctionAlias = 7,
    /**
     * Call count for a given function, identified by name.
     */
    FunctionExecution = 8,
    /**
     * Number of functions hit.
     */
    FunctionHit = 9,
    /**
     * Number of functions found.
     */
    FunctionInstrumented = 10,
    /**
     * Start and end line numbers for a given function leader, identified by index.
     */
    FunctionLeader = 11,
    /**
     * Start and end line numbers for a given function, identified by name.
     */
    FunctionLocation = 12,
    /**
     * Number of lines with a non-zero execution count.
     */
    LineHit = 13,
    /**
     * Number of instrumented lines.
     */
    LineInstrumented = 14,
    /**
     * The execution count for a line, identified by line number.
     */
    LineLocation = 15,
    /**
     * The test name.
     */
    TestName = 16,
    /**
     * The source code version ID.
     */
    Version = 17
}

/**
 * The default names as specified in the [linux-test-project/lcov/geninfo](https://github.com/linux-test-project/lcov/blob/3decc12ab1e7b34d2860393e2f40f0e1057d5c16/man/geninfo.1#L989-L1171)
 * description.
 */
export const defaultFieldNames = Object.freeze(fieldNames())
