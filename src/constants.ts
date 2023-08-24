import { fieldNames } from './lib/field-names.js'

/**
 * Field entry variants
 */
export enum Variant {
    None,
    BranchHit,
    BranchInstrumented,
    BranchLocation,
    EndOfRecord,
    FilePath,
    FunctionExecution,
    FunctionHit,
    FunctionInstrumented,
    FunctionLocation,
    LineHit,
    LineInstrumented,
    LineLocation,
    TestName,
    Version
}

/**
 * The default names as specified in the "linux-test-project/lcov/geninfo" description
 */
export const defaultFieldNames = Object.freeze(fieldNames())
