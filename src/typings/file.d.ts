export interface Lcov {
    branches: BranchEntry[]
    functions: FunctionEntry[]
    lines: LineEntry[]
    summaries: SectionSummary[]
}

export interface SectionSummary {
    branch: Summary
    function: Summary
    line: Summary
    name: string
    path: string
}

export interface Summary {
    hitCount: number
    instrumented: number
}

export interface LineEntry {
    hitCount: number
    lineNumber: number
}

export interface FunctionEntry extends LineEntry {
    name: string
}

export interface BranchEntry extends LineEntry {
    blockNumber: number
    branch: number
}
