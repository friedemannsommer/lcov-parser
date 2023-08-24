import { FieldNames } from '../typings/options.js'

/**
 * @returns FieldNames - an object which contains the default field names
 */
export function fieldNames(): FieldNames {
    return {
        branchHit: 'BRH',
        branchInstrumented: 'BRF',
        branchLocation: 'BRDA',
        endOfRecord: 'end_of_record',
        filePath: 'SF',
        functionExecution: 'FNDA',
        functionHit: 'FNH',
        functionInstrumented: 'FNF',
        functionLocation: 'FN',
        lineHit: 'LH',
        lineInstrumented: 'LF',
        lineLocation: 'DA',
        testName: 'TN',
        version: 'VER'
    }
}
