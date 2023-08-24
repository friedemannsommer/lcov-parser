import { Variant } from '../constants.js'

export function isEmptyField(variant: Variant): variant is Variant.EndOfRecord {
    return variant === Variant.EndOfRecord
}

export function isNonEmptyField(variant: Variant): boolean {
    return !isEmptyField(variant)
}
