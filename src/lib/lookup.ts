import { Variant } from '../constants.js'
import type { FieldNames } from '../typings/options.js'
import ByteMatch from './byte-match.js'
import { encode } from './utf-8.js'

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
    functionExecution: Variant.FunctionExecution,
    functionHit: Variant.FunctionHit,
    functionInstrumented: Variant.FunctionInstrumented,
    functionLocation: Variant.FunctionLocation,
    lineHit: Variant.LineHit,
    lineInstrumented: Variant.LineInstrumented,
    lineLocation: Variant.LineLocation,
    testName: Variant.TestName,
    version: Variant.Version
}

export function generateFieldLookup(fieldNameMap: FieldNames): FieldOptions[] {
    const fieldEntries = Object.entries(fieldNameMap) as Array<[keyof FieldNames, string]>
    const fieldCount = fieldEntries.length
    const fields = Array<FieldOptions>(fieldCount)

    for (let index = 0; index < fieldCount; index++) {
        fields[index] = {
            // technically, we should check whether the field name is in the map,
            // but in the name of performance, we're not going to do that
            variant: FIELD_NAME_MAP[fieldEntries[index][0]],
            matcher: new ByteMatch(encode(fieldEntries[index][1]))
        }
    }

    return fields.sort(sortFieldNames)
}

export function sortFieldNames(a: FieldOptions, b: FieldOptions): number {
    return b.matcher.size - a.matcher.size
}
