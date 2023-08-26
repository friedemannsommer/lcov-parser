import { Variant } from '../constants.js'
import {
    BranchLocationEntry,
    EntryVariants,
    FunctionExecutionEntry,
    FunctionLocationEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineLocationEntry,
    TestNameEntry
} from '../typings/entry.js'
import { BranchEntry, FunctionEntry, LineEntry, SectionSummary, Summary } from '../typings/file.js'

export type FunctionMap = Map<string, FunctionEntry>

export function handleResult(entry: EntryVariants, functionMap: FunctionMap, section: SectionSummary): boolean {
    switch (entry.variant) {
        case Variant.TestName:
            // creating a new test module, to prevent name conflicts simply clear the current (name -> index) map
            functionMap.clear()
            section.name = entry.name
            break
        case Variant.FilePath:
            section.path = entry.path
            break
        case Variant.EndOfRecord:
            // we've left the test module, to prevent name conflicts simply clear the current (name -> index) map
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

export function updateResult(
    sectionIndex: number,
    entry: EntryVariants,
    functionMap: FunctionMap,
    sections: SectionSummary[]
): number {
    if (entry.variant === Variant.TestName) {
        if (sectionIndex === sections.length) {
            sections.push(createSection(entry))
        } else {
            sections.push(createSection(entry))

            return sectionIndex + 1
        }
    } else if (handleResult(entry, functionMap, sections[sectionIndex])) {
        return sectionIndex + 1
    }

    return sectionIndex
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

function createUpdateFunctionSummary(
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
        functionSummary.hit = entry.called
    } else {
        functionSummary.line = entry.lineNumberStart
    }
}

function updateSectionSummary<Detail extends LineEntry>(
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

function createBranchSummary(entry: BranchLocationEntry): BranchEntry {
    return {
        block: entry.block,
        expression: entry.expression,
        hit: entry.taken,
        isException: entry.isException,
        line: entry.lineNumber
    }
}

function createFunctionSummary(entry: FunctionLocationEntry | FunctionExecutionEntry): FunctionEntry {
    return {
        hit: entry.variant === Variant.FunctionExecution ? entry.called : 0,
        line: entry.variant === Variant.FunctionLocation ? entry.lineNumberStart : 0,
        name: entry.name
    }
}

function createLineSummary(entry: LineLocationEntry): LineEntry {
    return {
        hit: entry.hit,
        line: entry.lineNumber
    }
}
