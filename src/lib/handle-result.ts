import { Variant } from '../constants.js'
import type {
    BranchLocationEntry,
    EntryVariants,
    FunctionExecutionEntry,
    FunctionLocationEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineLocationEntry,
    TestNameEntry
} from '../typings/entry.js'
import type { BranchEntry, FunctionEntry, LineEntry, SectionSummary, Summary } from '../typings/file.js'

export type FunctionMap = Map<string, FunctionEntry>

export function handleResult(entry: EntryVariants, functionMap: FunctionMap, section: SectionSummary): boolean {
    switch (entry.variant) {
        case Variant.TestName:
            // creating a new test module, to prevent name conflicts simply clear the current FunctionMap
            functionMap.clear()
            section.name = entry.name
            break
        case Variant.FilePath:
            section.path = entry.path
            break
        case Variant.EndOfRecord:
            // we've left the test module, to prevent name conflicts simply clear the current FunctionMap
            functionMap.clear()

            return true
        case Variant.FunctionLocation:
        case Variant.FunctionExecution:
            createUpdateFunctionSummary(functionMap, section.functions.details, entry)
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
    functionMap: FunctionMap,
    sections: SectionSummary[]
): number {
    if (entry.variant === Variant.TestName) {
        const length = sections.length
        // creating a new test module, clearing the current FunctionMap
        functionMap.clear()

        sections.push(createSection(entry))

        return length
    } else if (sectionIndex === sections.length) {
        // prevent OOB, which happens if "TestName" isn't the first variant encountered for a section
        sections[sectionIndex] = createSection()
    }

    return handleResult(entry, functionMap, sections[sectionIndex]) ? sectionIndex + 1 : sectionIndex
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
    functionMap: FunctionMap,
    functions: FunctionEntry[],
    entry: FunctionLocationEntry | FunctionExecutionEntry
): void {
    const functionSummary = functionMap.get(entry.name)

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
