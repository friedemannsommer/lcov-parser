import { Variant } from '../constants.js'
import type { FieldNames } from '../typings/options.js'
import ByteMatch from './byte-match.js'
import { encode } from './utf-8.js'

export type LookupResult = [Variant[], ByteMatch[]]

export function generateFieldLookup(fieldNameMap: FieldNames): LookupResult {
    const fieldNames = Object.keys(fieldNameMap) as Array<keyof FieldNames>
    const names = mapFieldNames(fieldNames)
    const values = Array<ByteMatch>(names.length)

    for (let index = 0; index < names.length; index++) {
        values[index] = new ByteMatch(encode(fieldNameMap[fieldNames[index]]))
    }

    return sortFieldNames(names, values)
}

export function mapFieldNames(fieldNames: Array<keyof FieldNames>): Variant[] {
    const variants = Array<Variant>(fieldNames.length)

    for (let index = 0; index < fieldNames.length; index++) {
        variants[index] = mapFieldName(fieldNames[index])
    }

    return variants
}

export function sortFieldNames(names: Variant[], values: ByteMatch[]): LookupResult {
    const indexMap = new Map<ByteMatch, number>()
    const sortedValues = values.slice().sort((a: ByteMatch, b: ByteMatch): number => (a.size > b.size ? -1 : 1))
    const sortedNames = Array<Variant>(names.length)

    for (let index = 0; index < sortedValues.length; index++) {
        indexMap.set(sortedValues[index], index)
    }

    for (let index = 0; index < names.length; index++) {
        sortedNames[indexMap.get(values[index])!] = names[index]
    }

    return [sortedNames, sortedValues]
}

export function mapFieldName(fieldName: keyof FieldNames): Variant {
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
        case 'version':
            return Variant.Version
    }
}
