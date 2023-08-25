export interface SectionSummary {
    /**
     * The overall number of branches found and how often they were hit.
     */
    branchSummary: Summary
    /**
     * List of branch entries, which contains one entry for each branch that was found.
     */
    branches: BranchEntry[]
    /**
     * The overall number of functions found and how often they were hit.
     */
    functionSummary: Summary
    /**
     * List of function entries, which contains one entry for each found function.
     */
    functions: FunctionEntry[]
    /**
     * The overall number of found lines and how often they were hit.
     */
    lineSummary: Summary
    /**
     * List of line entries, which contains one entry for each line that were found.
     */
    lines: LineEntry[]
    /**
     * The section name (also referred to as "test name").
     */
    name: string
    /**
     * The source file path.
     */
    path: string
}

export interface Summary {
    /**
     * The number of executions for this branch, function, or line.
     */
    hitCount: number
    /**
     * The number of branches, functions, or lines found.
     */
    instrumented: number
}

export interface LineEntry {
    /**
     * Number of executions for this line.
     */
    hitCount: number
    /**
     * The associated line number.
     */
    lineNumber: number
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
    blockNumber: number
    /**
     * The expression of the branch.
     */
    expression: string
    /**
     * Possibly a `catch` or otherwise exception related branch.
     */
    isException: boolean
}
