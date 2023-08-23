import { FieldNames } from '../typings/options.js'
import { encode } from './utf-8.js'
import ByteMatch from './byte-match.js'
import { Variant } from '../constants.js'

export type LookupResult = [Variant[], ByteMatch[]]

export function generateFieldLookup(fieldNameMap: FieldNames): LookupResult {
    const fieldNames = Object.keys(fieldNameMap) as Array<keyof FieldNames>
    const names = mapFieldNames(fieldNames)
    const values = Array<ByteMatch>(names.length)
    const lookup: LookupResult = [names, values]

    for (let index = 0; index < names.length; index++) {
        values[index] = new ByteMatch(encode(fieldNameMap[fieldNames[index]]))
    }

    return lookup
}

export function mapFieldNames(fieldNames: Array<keyof FieldNames>): Variant[] {
    const variants = Array<Variant>(fieldNames.length)

    for (let index = 0; index < fieldNames.length; index++) {
        variants[index] = mapFieldName(fieldNames[index])
    }

    return variants
}

function mapFieldName(fieldName: keyof FieldNames): Variant {
    switch (fieldName) {
        case 'branchHit':
            return Variant.BranchHit
        case 'branchInstrumented':
            return Variant.BranchInstrumented
        case 'branchLocation':
            return Variant.BranchLocation
        case 'endOfRecord':
            return Variant.EndOfRecord
        case 'filePath':
            return Variant.FilePath
        case 'functionExecution':
            return Variant.FunctionExecution
        case 'functionHit':
            return Variant.FunctionHit
        case 'functionInstrumented':
            return Variant.FunctionInstrumented
        case 'functionLocation':
            return Variant.FunctionLocation
        case 'lineHit':
            return Variant.LineHit
        case 'lineInstrumented':
            return Variant.LineInstrumented
        case 'lineLocation':
            return Variant.LineLocation
        case 'testName':
            return Variant.TestName
    }
}
