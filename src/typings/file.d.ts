export interface SectionSummary {
    branchSummary: Summary
    branches: BranchEntry[]
    functionSummary: Summary
    functions: FunctionEntry[]
    lineSummary: Summary
    lines: LineEntry[]
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
    expression: string
    isException: boolean
}
