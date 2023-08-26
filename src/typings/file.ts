export interface SectionSummary {
    /**
     * The overall number of branches found and how often they were hit, with a list of instrumented branches.
     */
    branches: Summary<BranchEntry>
    /**
     * The overall number of functions found and how often they were hit, with a lit of instrumented functions.
     */
    functions: Summary<FunctionEntry>
    /**
     * The overall number of found lines and how often they were hit, with a list of instrumented lines.
     */
    lines: Summary<LineEntry>
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
     * Lists all instrumented branches, functions, or lines.
     */
    details: Detail[]
    /**
     * The number of executions for this branch, function, or line.
     */
    hit: number
    /**
     * The number of branches, functions, or lines found.
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
     * A human-readable string, which should uniquely identify a given branch.
     */
    branch: string
    /**
     * Possibly a `catch` or otherwise exception related branch.
     */
    isException: boolean
}
