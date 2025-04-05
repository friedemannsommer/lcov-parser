import type { FieldNames } from '../typings/options.js'

/**
 * @returns - An object which contains the default field names
 * that are specified in [linux-test-project/lcov/geninfo](https://github.com/linux-test-project/lcov/blob/3decc12ab1e7b34d2860393e2f40f0e1057d5c16/man/geninfo.1#L989-L1171).
 */
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
        testName: 'TN',
        version: 'VER'
    }
}
