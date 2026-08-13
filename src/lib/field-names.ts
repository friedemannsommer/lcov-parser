import type { FieldNames } from '../typings/options.js'

export function fieldNames(): FieldNames {
    return {
        branchHit: 'BRH',
        branchInstrumented: 'BRF',
        branchLocation: 'BRDA',
        comment: '#',
        endOfRecord: 'end_of_record',
        filePath: 'SF',
        functionAlias: 'FNA',
        functionExecution: 'FNDA',
        functionHit: 'FNH',
        functionInstrumented: 'FNF',
        functionLeader: 'FNL',
        functionLocation: 'FN',
        lineHit: 'LH',
        lineInstrumented: 'LF',
        lineLocation: 'DA',
        mcdcHit: 'MCH',
        mcdcInstrumented: 'MCF',
        mcdcLocation: 'MCDC',
        testName: 'TN',
        version: 'VER'
    }
}
