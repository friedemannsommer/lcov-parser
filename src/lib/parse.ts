/**
 * Tries to parse the given value as `number`, if the result is `NaN`, zero is returned instead.
 */
export function parseInteger(val: string): number {
    const num = Number.parseInt(val)

    if (Number.isNaN(num)) {
        return 0
    }

    return num
}

/**
 * Checks if the given value is a blank space character
 * - character tabulation (9)
 * - line feed (10)
 * - line tabulation (11)
 * - form feed (12)
 * - carriage return (13)
 * - space (32)
 * - next line (133)
 * - no-break space (160)
 *
 * @param byte - UTF-8 encoded value
 */
export function isBlankSpace(byte: number): boolean {
    return (byte >= 9 && byte <= 13) || byte === 32 || byte === 133 || byte === 160
}
