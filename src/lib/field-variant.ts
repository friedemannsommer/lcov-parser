import { Variant } from '../constants.js'

/**
 * Checks if the given `variant` doesn't have value
 * @param variant - Field entry variant
 */
export function isEmptyField(variant: Variant): variant is Variant.EndOfRecord {
    return variant === Variant.EndOfRecord || variant === Variant.None
}

/**
 * Checks if the given `variant` has a value
 * @param variant - Field entry variant
 */
export function isNonEmptyField(variant: Variant): boolean {
    return !isEmptyField(variant)
}
