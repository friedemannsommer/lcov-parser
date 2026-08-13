import { Variant } from '../../constants.js'
import type {
    BranchLocationEntry,
    EndOfRecordEntry,
    FilePathEntry,
    FunctionAliasEntry,
    FunctionExecutionEntry,
    FunctionLeaderEntry,
    FunctionLocationEntry,
    LineLocationEntry,
    MCDCLocationEntry,
    MCDCSense,
    SummaryFoundEntry,
    SummaryHitEntry,
    TestNameEntry
} from '../../typings/entry.js'

export function getTestNameEntry(name: string): TestNameEntry {
    return {
        done: false,
        name,
        variant: Variant.TestName
    }
}

export function getFilePathEntry(path: string): FilePathEntry {
    return {
        done: false,
        path,
        variant: Variant.FilePath
    }
}

export function getEndOfRecord(): EndOfRecordEntry {
    return {
        done: false,
        variant: Variant.EndOfRecord
    }
}

export function getFunctionLocationEntry(name: string, value: number): FunctionLocationEntry {
    return {
        done: false,
        variant: Variant.FunctionLocation,
        name,
        lineEnd: 0,
        lineStart: value
    }
}

export function getFunctionExecutionEntry(name: string, value: number): FunctionExecutionEntry {
    return {
        done: false,
        hit: value,
        variant: Variant.FunctionExecution,
        name
    }
}

export function getFunctionLeaderEntry(index: number, value: number): FunctionLeaderEntry {
    return {
        done: false,
        index,
        lineStart: value,
        lineEnd: 0,
        aliases: [],
        variant: Variant.FunctionLeader
    }
}

export function getFunctionAliasEntry(index: number, value: number, name: string): FunctionAliasEntry {
    return {
        done: false,
        hit: value,
        index,
        name,
        variant: Variant.FunctionAlias
    }
}

export function getBranchLocationEntry(
    block = 1,
    branch = '_test_',
    hit = 2,
    isException = false,
    line = 4,
    isFallthrough = false,
    isUnreachable = false
): BranchLocationEntry {
    return {
        block,
        branch,
        done: false,
        hit,
        isException,
        isFallthrough,
        isUnreachable,
        line,
        variant: Variant.BranchLocation
    }
}

export function getMCDCLocationEntry(
    line = 4,
    groupSize = 2,
    sense: MCDCSense = 'f',
    hit = 1,
    index = 0,
    expression = '_test_',
    isUnreachable = false
): MCDCLocationEntry {
    return {
        done: false,
        expression,
        groupSize,
        hit,
        index,
        isUnreachable,
        line,
        sense,
        variant: Variant.MCDCLocation
    }
}

export function getLineLocationEntry(hit = 2, line = 4): LineLocationEntry {
    return {
        checksum: 'md5',
        done: false,
        hit,
        line,
        variant: Variant.LineLocation
    }
}

export function getInstrumentedEntry<V extends Variant>(variant: V, found = 6): SummaryFoundEntry<V> {
    return {
        done: false,
        found,
        variant
    }
}

export function getHitEntry<V extends Variant>(variant: V, hit = 6): SummaryHitEntry<V> {
    return {
        done: false,
        hit,
        variant
    }
}
