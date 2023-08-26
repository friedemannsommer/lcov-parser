import { Variant } from '../constants.js'

/**
 * Checks if the given {@link Variant} doesn't have a value.
 *
 * @param variant - The field entry variant to check.
 */
export function isEmptyField(variant: Variant): variant is Variant.EndOfRecord {
    return variant === Variant.EndOfRecord || variant === Variant.None
}

/**
 * Checks if the given {@link Variant} has a value.
 *
 * @param variant - The field entry variant to check.
 */
export function isNonEmptyField(variant: Variant): boolean {
    return !isEmptyField(variant)
}
