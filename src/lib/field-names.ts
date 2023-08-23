import { FieldNames } from '../typings/options.js'

const defaultFieldNames = fieldNames()

export default defaultFieldNames

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
        lineInstrumented: 'LH',
        lineLocation: 'DA',
        testName: 'TN'
    }
}
