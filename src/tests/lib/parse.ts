import type { Variant } from '../../constants.js'
import type { ParseResult } from '../../parser.js'

export function getParseResult<V extends Variant>(
    variant: V,
    value: string[] | null = null,
    done = false,
    incomplete = false
): ParseResult<V> {
    return {
        done,
        incomplete,
        value,
        variant
    }
}

export function getRawLcov(fieldName: string, value?: string): string {
    if (value) {
        return `${fieldName}:${value}\n`
    }

    return `${fieldName}\n`
}
