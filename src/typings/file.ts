import type { MCDCSense } from './entry.js'

export interface SectionSummary {
    /**
     * The overall number of branches found and how often they were hit, with a list of instrumented branches.
     */
    branches: Summary<BranchEntry>
    /**
     * The overall number of functions found and how often they were hit, with a list of instrumented functions.
     */
    functions: Summary<FunctionEntry>
    /**
     * The overall number of found lines and how often they were hit, with a list of instrumented lines.
     */
    lines: Summary<LineEntry>
    /**
     * The overall number of MC/DC conditions found and how often they were sensitized, with a list of
     * instrumented MC/DC conditions.
     */
    mcdc: Summary<MCDCEntry>
    /**
     * The section name (also referred to as "test name").
     */
    name: string
    /**
     * The source file path.
     */
    path: string
}

export interface Summary<Detail extends LineEntry> {
    /**
     * Lists all instrumented branches, functions, lines, or MC/DC conditions.
     */
    details: Detail[]
    /**
     * The number of times this branch, function, or line was executed (or, for MC/DC conditions, sensitized).
     */
    hit: number
    /**
     * The number of branches, functions, lines, or MC/DC conditions found.
     */
    instrumented: number
}

export interface LineEntry {
    /**
     * Number of executions for this line.
     */
    hit: number
    /**
     * The associated line number.
     */
    line: number
}

export interface FunctionEntry extends LineEntry {
    /**
     * Function name
     */
    name: string
}

export interface BranchEntry extends LineEntry {
    /**
     * The block number.
     */
    block: number
    /**
     * A string which uniquely identifies this branch. For some languages/tools this is an ordered index,
     * for others it may be a human-readable expression.
     */
    branch: string
    /**
     * Whether this branch is related to exception handling (*e.g.*, a `catch` block).
     */
    isException: boolean
    /**
     * Whether this branch is marked as "fallthrough" (*e.g.*, in the `gcov` output).
     */
    isFallthrough: boolean
    /**
     * Whether this branch is associated with an "unreachable" directive.
     */
    isUnreachable: boolean
}

export interface MCDCEntry extends LineEntry {
    /**
     * An arbitrary string, intended to be a meaningful description of the condition context.
     */
    expression: string
    /**
     * The size of the group this condition belongs to.
     */
    groupSize: number
    /**
     * The index of this condition within its group.
     */
    index: number
    /**
     * Whether this condition is associated with an "unreachable" directive.
     */
    isUnreachable: boolean
    /**
     * The sense of this condition. See {@link MCDCSense} for more information.
     */
    sense: MCDCSense
}
