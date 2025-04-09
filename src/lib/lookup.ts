import { Variant } from '../constants.js'
import type { FieldNames } from '../typings/options.js'
import ByteMatch from './byte-match.js'

export interface FieldOptions {
    variant: Variant
    matcher: ByteMatch
}

export const FIELD_NAME_MAP: Readonly<Record<keyof FieldNames, Variant>> = {
    branchHit: Variant.BranchHit,
    branchInstrumented: Variant.BranchInstrumented,
    branchLocation: Variant.BranchLocation,
    comment: Variant.Comment,
    endOfRecord: Variant.EndOfRecord,
    filePath: Variant.FilePath,
    functionAlias: Variant.FunctionAlias,
    functionExecution: Variant.FunctionExecution,
    functionHit: Variant.FunctionHit,
    functionInstrumented: Variant.FunctionInstrumented,
    functionLeader: Variant.FunctionLeader,
    functionLocation: Variant.FunctionLocation,
    lineHit: Variant.LineHit,
    lineInstrumented: Variant.LineInstrumented,
    lineLocation: Variant.LineLocation,
    testName: Variant.TestName,
    version: Variant.Version
}

export function generateFieldLookup(fieldNameMap: FieldNames): FieldOptions[] {
    const encoder = new TextEncoder()

    return Object.entries(fieldNameMap)
        .map(([key, value]) => ({
            variant: FIELD_NAME_MAP[key as keyof FieldNames],
            matcher: new ByteMatch(encoder.encode(value))
        }))
        .sort(sortFieldNames)
}

export function sortFieldNames(a: FieldOptions, b: FieldOptions): number {
    return b.matcher.size - a.matcher.size
}
