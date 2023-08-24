import { Readable } from 'node:stream'

import { Variant } from '../constants.js'
import transformResult from '../lib/transform-result.js'
import { LcovParser, ParseResult } from '../parser.js'
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

export function transformSynchronous(results: ParseResult[]): SectionSummary[] {
    const functionMap = new Map<string, number>()
    const result: SectionSummary[] = []
    let sectionIndex = 0

    for (const parseResult of results) {
        sectionIndex = updateResult(sectionIndex, transformResult(parseResult), functionMap, result)
    }

    return result
}

export function transformAsynchronous(parser: LcovParser, stream: Readable): Promise<SectionSummary[]> {
    const functionMap = new Map<string, number>()
    const result: SectionSummary[] = []
    let sectionIndex = 0

    return new Promise((resolve, reject): void => {
        function handleChunk(chunk: unknown): void {
            if (typeof chunk === 'string') {
                parser.write(Buffer.from(chunk))
            } else if (Buffer.isBuffer(chunk)) {
                parser.write(chunk)
            } else {
                unsubscribe()
                reject(new Error('received unsupported chunk type.'))
                return
            }

            for (const parseResult of parser.flush()) {
                sectionIndex = updateResult(sectionIndex, transformResult(parseResult), functionMap, result)
            }
        }

        function handleEnd(): void {
            unsubscribe()
            resolve(result)
        }

        function handleError(err: Error): void {
            unsubscribe()
            reject(err)
        }

        function unsubscribe(): void {
            stream.off('data', handleChunk)
            stream.off('error', handleError)
            stream.off('end', handleEnd)
        }

        stream.on('data', handleChunk)
        stream.once('error', handleError)
        stream.once('end', handleEnd)
    })
}

function updateResult(
    sectionIndex: number,
    entry: EntryVariants,
    functionMap: FunctionMap,
    sections: SectionSummary[]
): number {
    switch (entry.variant) {
        case Variant.TestName:
            // creating a new test module, to prevent name conflicts simply clear the current (name -> index) map
            functionMap.clear()

            if (sectionIndex === sections.length) {
                sections.push(createSection(entry))
            } else {
                sections.push(createSection(entry))

                return sectionIndex + 1
            }
            break
        case Variant.FilePath:
            sections[sectionIndex].path = entry.path
            break
        case Variant.EndOfRecord:
            // we've left the test module, to prevent name conflicts simply clear the current (name -> index) map
            functionMap.clear()

            return sectionIndex + 1
        case Variant.FunctionLocation:
        case Variant.FunctionExecution:
            createUpdateFunctionSummary(functionMap, sections[sectionIndex].functions, entry)
            break
        case Variant.BranchLocation:
            sections[sectionIndex].branches.push(createBranchSummary(entry))
            break
        case Variant.LineLocation:
            sections[sectionIndex].lines.push(createLineSummary(entry))
            break
        case Variant.BranchInstrumented:
        case Variant.BranchHit:
            updateSectionSummary(sections[sectionIndex].branchSummary, entry)
            break
        case Variant.FunctionInstrumented:
        case Variant.FunctionHit:
            updateSectionSummary(sections[sectionIndex].functionSummary, entry)
            break
        case Variant.LineInstrumented:
        case Variant.LineHit:
            updateSectionSummary(sections[sectionIndex].lineSummary, entry)
            break
    }

    return sectionIndex
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

function createSection(entry: TestNameEntry): SectionSummary {
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
        name: entry.name,
        path: ''
    }
}
