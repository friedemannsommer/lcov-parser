import { Variant } from '../constants.js'
import type {
    BranchLocationEntry,
    EntryVariants,
    FunctionAliasEntry,
    FunctionExecutionEntry,
    FunctionLeaderEntry,
    FunctionLocationEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineLocationEntry,
    TestNameEntry
} from '../typings/entry.js'
import type { BranchEntry, FunctionEntry, LineEntry, SectionSummary, Summary } from '../typings/file.js'

export type FunctionMap = Map<string, FunctionEntry>
export type FunctionLeaders = Map<number, FunctionLeaderEntry>

export function handleResult(
    entry: EntryVariants,
    functionLeaders: FunctionLeaders,
    functionMap: FunctionMap,
    section: SectionSummary
): boolean {
    switch (entry.variant) {
        case Variant.TestName:
            // creating a new test module: clear function contexts to prevent name conflicts from previous modules
            functionMap.clear()
            functionLeaders.clear()
            section.name = entry.name
            break
        case Variant.FilePath:
            section.path = entry.path
            break
        case Variant.EndOfRecord:
            // we've left the test module: clear function contexts to prevent name conflicts
            functionMap.clear()
            functionLeaders.clear()
            return true
        case Variant.FunctionLeader:
            functionLeaders.set(entry.index, entry)
            break
        case Variant.FunctionAlias:
        case Variant.FunctionLocation:
        case Variant.FunctionExecution:
            createUpdateFunctionSummary(functionLeaders, functionMap, section.functions.details, entry)
            break
        case Variant.BranchLocation:
            section.branches.details.push(createBranchSummary(entry))
            break
        case Variant.LineLocation:
            section.lines.details.push(createLineSummary(entry))
            break
        case Variant.BranchInstrumented:
        case Variant.BranchHit:
            updateSectionSummary(section.branches, entry)
            break
        case Variant.FunctionInstrumented:
        case Variant.FunctionHit:
            updateSectionSummary(section.functions, entry)
            break
        case Variant.LineInstrumented:
        case Variant.LineHit:
            updateSectionSummary(section.lines, entry)
            break
    }

    return false
}

export function updateResults(
    sectionIndex: number,
    entry: EntryVariants,
    functionLeaders: FunctionLeaders,
    functionMap: FunctionMap,
    sections: SectionSummary[]
): number {
    if (sectionIndex === sections.length) {
        // the section for the current index doesn't exist, creating a new one with default values
        sections[sectionIndex] = createSection()
    }

    return handleResult(entry, functionLeaders, functionMap, sections[sectionIndex]) ? sectionIndex + 1 : sectionIndex
}

export function createSection(entry?: TestNameEntry): SectionSummary {
    return {
        branches: {
            details: [],
            hit: 0,
            instrumented: 0
        },
        functions: {
            details: [],
            hit: 0,
            instrumented: 0
        },
        lines: {
            details: [],
            hit: 0,
            instrumented: 0
        },
        name: entry ? entry.name : '',
        path: ''
    }
}

export function createUpdateFunctionSummary(
    functionLeaders: FunctionLeaders,
    functionMap: FunctionMap,
    functions: FunctionEntry[],
    entry: FunctionAliasEntry | FunctionLocationEntry | FunctionExecutionEntry
): void {
    const functionSummary = functionMap.get(entry.name)
    if (entry.variant === Variant.FunctionAlias) {
        // biome-ignore lint/style/noNonNullAssertion: Leader always comes before aliases of a function
        const functionLeader = functionLeaders.get(entry.index)!
        if (functionSummary === undefined) {
            const summary = {
                hit: entry.hit,
                line: functionLeaders.get(entry.index)?.lineStart ?? 0,
                name: entry.name
            }

            functionMap.set(entry.name, summary)
            functions.push(summary)
        } else {
            functionSummary.hit += entry.hit
            functionSummary.line = functionLeader.lineStart
        }
        return
    }

    if (functionSummary === undefined) {
        const summary = createFunctionSummary(entry)

        functionMap.set(entry.name, summary)
        functions.push(summary)
    } else if (entry.variant === Variant.FunctionExecution) {
        functionSummary.hit += entry.hit
    } else {
        functionSummary.line = entry.lineStart
    }
}

export function updateSectionSummary<Detail extends LineEntry>(
    summary: Summary<Detail>,
    entry: HitEntryVariants | InstrumentedEntryVariants
): void {
    const variant = entry.variant

    if (variant === Variant.BranchHit || variant === Variant.FunctionHit || variant === Variant.LineHit) {
        summary.hit += entry.hit
    } else {
        summary.instrumented += entry.found
    }
}

export function createBranchSummary(entry: BranchLocationEntry): BranchEntry {
    return {
        block: entry.block,
        branch: entry.branch,
        hit: entry.hit,
        isException: entry.isException,
        line: entry.line
    }
}

export function createFunctionSummary(entry: FunctionLocationEntry | FunctionExecutionEntry): FunctionEntry {
    return {
        hit: entry.variant === Variant.FunctionExecution ? entry.hit : 0,
        line: entry.variant === Variant.FunctionLocation ? entry.lineStart : 0,
        name: entry.name
    }
}

export function createLineSummary(entry: LineLocationEntry): LineEntry {
    return {
        hit: entry.hit,
        line: entry.line
    }
}
