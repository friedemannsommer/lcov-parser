import { Variant } from '../constants.js'
import type { ParseResult } from '../parser.js'
import type {
    BranchLocationEntry,
    CommentEntry,
    EndOfRecordEntry,
    EntryVariants,
    FilePathEntry,
    FunctionAliasEntry,
    FunctionExecutionEntry,
    FunctionLeaderEntry,
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

const handlers = {
    [Variant.BranchHit]: transformHit,
    [Variant.BranchInstrumented]: transformInstrumented,
    [Variant.BranchLocation]: transformBranchLocation,
    [Variant.Comment]: transformComment,
    [Variant.EndOfRecord]: transformEndOfRecord,
    [Variant.FilePath]: transformFilePath,
    [Variant.FunctionAlias]: transformFunctionAlias,
    [Variant.FunctionExecution]: transformFunctionExecution,
    [Variant.FunctionHit]: transformHit,
    [Variant.FunctionInstrumented]: transformInstrumented,
    [Variant.FunctionLeader]: transformFunctionLeader,
    [Variant.FunctionLocation]: transformFunctionLocation,
    [Variant.LineHit]: transformHit,
    [Variant.LineInstrumented]: transformInstrumented,
    [Variant.LineLocation]: transformLineLocation,
    [Variant.TestName]: transformTestName,
    [Variant.Version]: transformVersion
}

export default function transformResult(result: ParseResult): EntryVariants {
    if (result.incomplete) {
        return intoNone(result)
    }

    const handler = handlers[result.variant as Exclude<Variant, Variant.None>]
    // since the `handlers` record contains too many different functions, does TypeScript reduce the type to never
    // so to be able to call the handler which is known to accept the given result cast it to never
    return handler ? handler(result as never) : intoNone(result)
}

export function intoNone(result: ParseResult): NoneEntry {
    return {
        done: result.done,
        incomplete: result.incomplete,
        variant: Variant.None
    }
}

function parseIntValue(result: ParseResult): number {
    return result.value?.[0] !== undefined ? parseInteger(result.value[0]) : 0
}

export function transformHit(result: ParseResultHit): HitEntryVariants {
    return {
        done: result.done,
        hit: parseIntValue(result),
        variant: result.variant
    }
}

export function transformInstrumented(result: ParseResultInstrumented): InstrumentedEntryVariants {
    return {
        done: result.done,
        found: parseIntValue(result),
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
        // if the branch contained "," (semicolon), add them back by joining the possibly related values
        branch = result.value.slice(2, -1).join(',')
        taken = branchTaken === '-' ? 0 : parseInteger(branchTaken)
    }

    return {
        block,
        branch,
        done: result.done,
        hit: taken,
        isException,
        line,
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
    return {
        done: result.done,
        path: result.value?.join(',') ?? '',
        variant: result.variant
    }
}

export function transformFunctionExecution(result: ParseResult<Variant.FunctionExecution>): FunctionExecutionEntry {
    let hit = 0
    let name = ''

    if (result.value !== null && result.value.length >= 2) {
        hit = parseInteger(result.value[0])
        name = result.value.slice(1).join(',')
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

        if (result.value.length === 2) {
            name = result.value[1]
        } else if (lineEnd < lineStart) {
            name = result.value.slice(1).join(',')
        } else {
            name = result.value.slice(2).join(',')
        }
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
    return {
        done: result.done,
        name: result.value?.[0] ?? '',
        variant: result.variant
    }
}

export function transformVersion(result: ParseResult<Variant.Version>): VersionEntry {
    return {
        done: result.done,
        variant: result.variant,
        version: result.value?.[0] ?? ''
    }
}

export function transformComment(result: ParseResult<Variant.Comment>): CommentEntry {
    return {
        done: result.done,
        variant: result.variant,
        comment: result.value !== null ? result.value.join(',') : ''
    }
}

export function transformFunctionAlias(result: ParseResult<Variant.FunctionAlias>): FunctionAliasEntry {
    let name = ''
    let hit = 0
    let index = 0

    if (result.value != null && result.value.length >= 3) {
        index = parseInteger(result.value[0])
        hit = parseInteger(result.value[1])
        name = result.value.slice(2).join(',')
    }

    return {
        done: result.done,
        hit,
        index,
        name,
        variant: result.variant
    }
}

export function transformFunctionLeader(result: ParseResult<Variant.FunctionLeader>): FunctionLeaderEntry {
    let lineStart = 0
    let lineEnd = 0
    let index = 0

    if (result.value !== null && result.value.length >= 2) {
        index = parseInteger(result.value[0])
        lineStart = parseInteger(result.value[1])

        if (result.value.length >= 3) {
            lineEnd = parseInteger(result.value[2])
        }
    }

    return {
        done: result.done,
        lineEnd,
        lineStart,
        index,
        aliases: [],
        variant: result.variant
    }
}
