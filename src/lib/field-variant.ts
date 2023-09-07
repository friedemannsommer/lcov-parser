import { Variant } from '../constants.js'

export type EmptyVariants = Variant.EndOfRecord | Variant.None
export type NonEmptyVariants =
    | Variant.BranchHit
    | Variant.BranchInstrumented
    | Variant.BranchLocation
    | Variant.Comment
    | Variant.FilePath
    | Variant.FunctionExecution
    | Variant.FunctionHit
    | Variant.FunctionInstrumented
    | Variant.FunctionLocation
    | Variant.LineHit
    | Variant.LineInstrumented
    | Variant.LineLocation
    | Variant.TestName
    | Variant.Version

/**
 * Checks if the given {@link Variant} doesn't have a value.
 *
 * @param variant - The field entry variant to check.
 */
export function isEmptyField(variant: Variant): variant is EmptyVariants {
    return variant === Variant.EndOfRecord || variant === Variant.None
}

/**
 * Checks if the given {@link Variant} has a value.
 *
 * @param variant - The field entry variant to check.
 */
export function isNonEmptyField(variant: Variant): variant is NonEmptyVariants {
    return !isEmptyField(variant)
}
