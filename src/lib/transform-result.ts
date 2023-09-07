import { Variant } from '../constants.js'
import type { ParseResult } from '../parser.js'
import type {
    BranchLocationEntry,
    CommentEntry,
    EndOfRecordEntry,
    EntryVariants,
    FilePathEntry,
    FunctionExecutionEntry,
    FunctionLocationEntry,
    HitEntryVariants,
    InstrumentedEntryVariants,
    LineLocationEntry,
    NoneEntry,
    TestNameEntry,
    VersionEntry
} from '../typings/entry.js'
import { parseInteger } from './parse.js'

export type ParseResultHit = ParseResult<Variant.BranchHit | Variant.FunctionHit | Variant.LineHit>
export type ParseResultInstrumented = ParseResult<
    Variant.BranchInstrumented | Variant.FunctionInstrumented | Variant.LineInstrumented
>

export default function transformResult(result: ParseResult): EntryVariants {
    if (result.incomplete) {
        return intoNone(result)
    }

    switch (result.variant) {
        case Variant.None:
            return intoNone(result)
        case Variant.BranchHit:
        case Variant.FunctionHit:
        case Variant.LineHit:
            return transformHit(result as ParseResultHit)
        case Variant.BranchInstrumented:
        case Variant.FunctionInstrumented:
        case Variant.LineInstrumented:
            return transformInstrumented(result as ParseResultInstrumented)
        case Variant.BranchLocation:
            return transformBranchLocation(result as ParseResult<Variant.BranchLocation>)
        case Variant.EndOfRecord:
            return transformEndOfRecord(result as ParseResult<Variant.EndOfRecord>)
        case Variant.FilePath:
            return transformFilePath(result as ParseResult<Variant.FilePath>)
        case Variant.FunctionExecution:
            return transformFunctionExecution(result as ParseResult<Variant.FunctionExecution>)
        case Variant.FunctionLocation:
            return transformFunctionLocation(result as ParseResult<Variant.FunctionLocation>)
        case Variant.LineLocation:
            return transformLineLocation(result as ParseResult<Variant.LineLocation>)
        case Variant.TestName:
            return transformTestName(result as ParseResult<Variant.TestName>)
        case Variant.Version:
            return transformVersion(result as ParseResult<Variant.Version>)
        case Variant.Comment:
            return transformComment(result as ParseResult<Variant.Comment>)
    }
}

export function intoNone(result: ParseResult): NoneEntry {
    return {
        done: result.done,
        incomplete: result.incomplete,
        variant: Variant.None
    }
}

export function transformHit(result: ParseResultHit): HitEntryVariants {
    let hit = 0

    if (result.value !== null && result.value.length !== 0) {
        hit = parseInteger(result.value[0])
    }

    return {
        done: result.done,
        hit,
        variant: result.variant
    }
}

export function transformInstrumented(result: ParseResultInstrumented): InstrumentedEntryVariants {
    let found = 0

    if (result.value !== null && result.value.length !== 0) {
        found = parseInteger(result.value[0])
    }

    return {
        done: result.done,
        found,
        variant: result.variant
    }
}

export function transformBranchLocation(result: ParseResult<Variant.BranchLocation>): BranchLocationEntry {
    let block = 0
    let branch = ''
    let isException = false
    let line = 0
    let taken = 0

    if (result.value !== null && result.value.length >= 4) {
        const branchTaken = result.value[result.value.length - 1]

        line = parseInteger(result.value[0])
        isException = result.value[1].startsWith('e')
        block = parseInteger(isException ? result.value[1].slice(1) : result.value[1])
        // if the branch contained "," (semicolon) add them back by joining the possibly related values
        branch = result.value.slice(2, -1).join(',')
        taken = branchTaken === '-' ? 0 : parseInteger(branchTaken)
    }

    return {
        block,
        done: result.done,
        branch,
        isException,
        line,
        hit: taken,
        variant: result.variant
    }
}

export function transformEndOfRecord(result: ParseResult<Variant.EndOfRecord>): EndOfRecordEntry {
    return {
        done: result.done,
        variant: result.variant
    }
}

export function transformFilePath(result: ParseResult<Variant.FilePath>): FilePathEntry {
    let path = ''

    if (result.value !== null && result.value.length !== 0) {
        // if there were "," (semicolons) add them back by joining the whole array
        path = result.value.join(',')
    }

    return {
        done: result.done,
        path,
        variant: result.variant
    }
}

export function transformFunctionExecution(result: ParseResult<Variant.FunctionExecution>): FunctionExecutionEntry {
    let hit = 0
    let name = ''

    if (result.value !== null && result.value.length >= 2) {
        hit = parseInteger(result.value[0])
        name = result.value[1]
    }

    return {
        hit,
        done: result.done,
        name,
        variant: result.variant
    }
}

export function transformFunctionLocation(result: ParseResult<Variant.FunctionLocation>): FunctionLocationEntry {
    let lineEnd = 0
    let lineStart = 0
    let name = ''

    if (result.value !== null && result.value.length >= 2) {
        lineStart = parseInteger(result.value[0])
        lineEnd = parseInteger(result.value[1])
        name =
            lineEnd < lineStart || result.value.length === 2
                ? result.value[1]
                : result.value.length >= 3
                ? result.value[2]
                : ''
    }

    return {
        done: result.done,
        lineEnd,
        lineStart,
        name,
        variant: result.variant
    }
}

export function transformLineLocation(result: ParseResult<Variant.LineLocation>): LineLocationEntry {
    let checksum = ''
    let hit = 0
    let line = 0

    if (result.value !== null && result.value.length >= 2) {
        line = parseInteger(result.value[0])
        hit = parseInteger(result.value[1])

        if (result.value.length >= 3) {
            checksum = result.value[2]
        }
    }

    return {
        checksum,
        done: result.done,
        hit,
        line,
        variant: result.variant
    }
}

export function transformTestName(result: ParseResult<Variant.TestName>): TestNameEntry {
    let name = ''

    if (result.value !== null && result.value.length !== 0) {
        name = result.value[0]
    }

    return {
        done: result.done,
        name,
        variant: result.variant
    }
}

export function transformVersion(result: ParseResult<Variant.Version>): VersionEntry {
    let version = ''

    if (result.value !== null && result.value.length !== 0) {
        version = result.value[0]
    }

    return {
        done: result.done,
        variant: result.variant,
        version
    }
}

export function transformComment(result: ParseResult<Variant.Comment>): CommentEntry {
    return {
        done: result.done,
        variant: result.variant,
        comment: result.value !== null ? result.value.join(',') : ''
    }
}
