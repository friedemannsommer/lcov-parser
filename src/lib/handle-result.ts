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

type FunctionMap = Map<string, number>

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
            createUpdateFunctionSummary(functionMap, section.functions, entry)
            break
        case Variant.BranchLocation:
            section.branches.push(createBranchSummary(entry))
            break
        case Variant.LineLocation:
            section.lines.push(createLineSummary(entry))
            break
        case Variant.BranchInstrumented:
        case Variant.BranchHit:
            updateSectionSummary(section.branchSummary, entry)
            break
        case Variant.FunctionInstrumented:
        case Variant.FunctionHit:
            updateSectionSummary(section.functionSummary, entry)
            break
        case Variant.LineInstrumented:
        case Variant.LineHit:
            updateSectionSummary(section.lineSummary, entry)
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
        branchSummary: {
            hitCount: 0,
            instrumented: 0
        },
        branches: [],
        functionSummary: {
            hitCount: 0,
            instrumented: 0
        },
        functions: [],
        lineSummary: {
            hitCount: 0,
            instrumented: 0
        },
        lines: [],
        name: entry ? entry.name : '',
        path: ''
    }
}

function createUpdateFunctionSummary(
    functionMap: FunctionMap,
    functions: FunctionEntry[],
    entry: FunctionLocationEntry | FunctionExecutionEntry
): void {
    const index = functionMap.get(entry.name)

    if (index === undefined) {
        functionMap.set(entry.name, functions.length)
        functions.push(createFunctionSummary(entry))
    } else if (entry.variant === Variant.FunctionExecution) {
        functions[index].hitCount = entry.called
    } else {
        functions[index].lineNumber = entry.lineNumberStart
    }
}

function updateSectionSummary(summary: Summary, entry: HitEntryVariants | InstrumentedEntryVariants): void {
    const variant = entry.variant

    if (variant === Variant.BranchHit || variant === Variant.FunctionHit || variant === Variant.LineHit) {
        summary.hitCount += entry.hit
    } else {
        summary.instrumented += entry.found
    }
}

function createBranchSummary(entry: BranchLocationEntry): BranchEntry {
    return {
        blockNumber: entry.block,
        expression: entry.expression,
        hitCount: entry.taken,
        isException: entry.isException,
        lineNumber: entry.lineNumber
    }
}

function createFunctionSummary(entry: FunctionLocationEntry | FunctionExecutionEntry): FunctionEntry {
    return {
        hitCount: entry.variant === Variant.FunctionExecution ? entry.called : 0,
        lineNumber: entry.variant === Variant.FunctionLocation ? entry.lineNumberStart : 0,
        name: entry.name
    }
}

function createLineSummary(entry: LineLocationEntry): LineEntry {
    return {
        hitCount: entry.hit,
        lineNumber: entry.lineNumber
    }
}