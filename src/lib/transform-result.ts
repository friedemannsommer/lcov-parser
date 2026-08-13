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
    MCDCLocationEntry,
    NoneEntry,
    TestNameEntry,
    VersionEntry
} from '../typings/entry.js'
import { parseInteger } from './parse.js'

export type ParseResultHit = ParseResult<Variant.BranchHit | Variant.FunctionHit | Variant.LineHit | Variant.MCDCHit>
export type ParseResultInstrumented = ParseResult<
    Variant.BranchInstrumented | Variant.FunctionInstrumented | Variant.LineInstrumented | Variant.MCDCInstrumented
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
    [Variant.MCDCHit]: transformHit,
    [Variant.MCDCInstrumented]: transformInstrumented,
    [Variant.MCDCLocation]: transformMCDCLocation,
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

/**
 * A `<block>` field of a {@link Variant.BranchLocation} entry may be prefixed with any combination of
 * `e` (exception), `f` (fallthrough), and `U` (unreachable) flags, in any order.
 */
function isBranchFlagChar(char: string): boolean {
    return char === 'e' || char === 'f' || char === 'U'
}

export function transformBranchLocation(result: ParseResult<Variant.BranchLocation>): BranchLocationEntry {
    let block = 0
    let branch = ''
    let isException = false
    let isFallthrough = false
    let isUnreachable = false
    let line = 0
    let taken = 0

    if (result.value !== null && result.value.length >= 4) {
        const branchTaken = result.value[result.value.length - 1]
        const blockField = result.value[1]
        let flagLength = 0

        line = parseInteger(result.value[0])

        while (flagLength < blockField.length && isBranchFlagChar(blockField[flagLength])) {
            flagLength++
        }

        if (flagLength > 0) {
            const flags = blockField.slice(0, flagLength)

            isException = flags.includes('e')
            isFallthrough = flags.includes('f')
            isUnreachable = flags.includes('U')
        }

        block = parseInteger(blockField.slice(flagLength))
        // if the branch contained "," (comma), add them back by joining the possibly related values
        branch = result.value.slice(2, -1).join(',')
        taken = branchTaken === '-' ? 0 : parseInteger(branchTaken)
    }

    return {
        block,
        branch,
        done: result.done,
        hit: taken,
        isException,
        isFallthrough,
        isUnreachable,
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

        if (result.value.length === 2) {
            name = result.value[1]
        } else {
            lineEnd = parseInteger(result.value[1])
            name = result.value[2]
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
        name = result.value[2]
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

export function transformMCDCLocation(result: ParseResult<Variant.MCDCLocation>): MCDCLocationEntry {
    let expression = ''
    let groupSize = 0
    let hit = 0
    let index = 0
    let isUnreachable = false
    let line = 0
    let sense: MCDCLocationEntry['sense'] = 'f'

    if (result.value !== null && result.value.length >= 6) {
        const groupSizeField = result.value[1]

        line = parseInteger(result.value[0])
        isUnreachable = groupSizeField.startsWith('U')
        groupSize = parseInteger(isUnreachable ? groupSizeField.slice(1) : groupSizeField)
        sense = result.value[2] === 't' ? 't' : 'f'
        hit = parseInteger(result.value[3])
        index = parseInteger(result.value[4])
        // if the expression contained "," (comma), add them back by joining the possibly related values
        expression = result.value.slice(5).join(',')
    }

    return {
        done: result.done,
        expression,
        groupSize,
        hit,
        index,
        isUnreachable,
        line,
        sense,
        variant: result.variant
    }
}
