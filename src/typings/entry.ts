import type { Variant } from '../constants.js'

export type EntryVariants =
    | BranchHitEntry
    | BranchInstrumentedEntry
    | BranchLocationEntry
    | CommentEntry
    | EndOfRecordEntry
    | FilePathEntry
    | FunctionAliasEntry
    | FunctionExecutionEntry
    | FunctionHitEntry
    | FunctionInstrumentedEntry
    | FunctionLeaderEntry
    | FunctionLocationEntry
    | LineHitEntry
    | LineInstrumentedEntry
    | LineLocationEntry
    | MCDCHitEntry
    | MCDCInstrumentedEntry
    | MCDCLocationEntry
    | NoneEntry
    | TestNameEntry
    | VersionEntry

export type HitEntryVariants = BranchHitEntry | FunctionHitEntry | LineHitEntry | MCDCHitEntry
export type InstrumentedEntryVariants =
    | BranchInstrumentedEntry
    | FunctionInstrumentedEntry
    | LineInstrumentedEntry
    | MCDCInstrumentedEntry

/**
 * The sense of a MC/DC condition, *i.e.* whether the condition outcome changes if the corresponding condition
 * changes from `false` to `true` (`"t"`) or from `true` to `false` (`"f"`).
 */
export type MCDCSense = 'f' | 't'

export type EndOfRecordEntry = Entry<Variant.EndOfRecord>
export type BranchHitEntry = SummaryHitEntry<Variant.BranchHit>
export type BranchInstrumentedEntry = SummaryFoundEntry<Variant.BranchInstrumented>
export type FunctionHitEntry = SummaryHitEntry<Variant.FunctionHit>
export type FunctionInstrumentedEntry = SummaryFoundEntry<Variant.FunctionInstrumented>
export type LineHitEntry = SummaryHitEntry<Variant.LineHit>
export type LineInstrumentedEntry = SummaryFoundEntry<Variant.LineInstrumented>
export type MCDCHitEntry = SummaryHitEntry<Variant.MCDCHit>
export type MCDCInstrumentedEntry = SummaryFoundEntry<Variant.MCDCInstrumented>

export interface Entry<V extends Variant = Variant.None> {
    done: boolean
    variant: V
}

export interface NoneEntry extends Entry {
    incomplete: boolean
}

export interface SummaryFoundEntry<V extends Variant> extends Entry<V> {
    found: number
}

export interface SummaryHitEntry<V extends Variant> extends Entry<V> {
    hit: number
}

export interface BranchLocationEntry extends Entry<Variant.BranchLocation> {
    block: number
    branch: string
    hit: number
    isException: boolean
    isFallthrough: boolean
    isUnreachable: boolean
    line: number
}

export interface FilePathEntry extends Entry<Variant.FilePath> {
    path: string
}

export interface FunctionExecutionEntry extends Entry<Variant.FunctionExecution> {
    hit: number
    name: string
}

export interface FunctionLocationEntry extends Entry<Variant.FunctionLocation> {
    lineEnd: number
    lineStart: number
    name: string
}

export interface LineLocationEntry extends Entry<Variant.LineLocation> {
    checksum: string
    hit: number
    line: number
}

export interface TestNameEntry extends Entry<Variant.TestName> {
    name: string
}

export interface VersionEntry extends Entry<Variant.Version> {
    version: string
}

export interface CommentEntry extends Entry<Variant.Comment> {
    comment: string
}

export interface FunctionAliasEntry extends Entry<Variant.FunctionAlias> {
    hit: number
    index: number
    name: string
}

export interface FunctionLeaderEntry extends Entry<Variant.FunctionLeader> {
    index: number
    lineEnd: number
    lineStart: number
    aliases: FunctionAliasEntry[]
}

export interface MCDCLocationEntry extends Entry<Variant.MCDCLocation> {
    expression: string
    groupSize: number
    hit: number
    index: number
    isUnreachable: boolean
    line: number
    sense: MCDCSense
}
