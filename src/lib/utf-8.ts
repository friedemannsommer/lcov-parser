/**
 * Author: The Closure Library Authors
 * License: Apache-2.0
 * Source URL: https://github.com/google/closure-library/blob/304bafec88977b97bf25abac31915f3e2876d1d9/closure/goog/crypt/crypt.js#L176-L208
 *
 * @param str - UTF-16 string to be encoded into bytes
 * @returns Array<number> - UTF-8 bytes
 */
export function encode(str: string): number[] {
    const length = str.length
    const bytes: number[] = []

    for (let i = 0; i < length; i++) {
        let charCode = str.charCodeAt(i)

        if (charCode < 128) {
            bytes.push(charCode)
        } else if (charCode < 2048) {
            bytes.push((charCode >> 6) | 192, (charCode & 63) | 128)
        } else if ((charCode & 0xfc00) === 0xd800 && i + 1 < length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            charCode = 0x10000 + ((charCode & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff)

            bytes.push(
                (charCode >> 18) | 240,
                ((charCode >> 12) & 63) | 128,
                ((charCode >> 6) & 63) | 128,
                (charCode & 63) | 128
            )
        } else {
            bytes.push((charCode >> 12) | 224, ((charCode >> 6) & 63) | 128, (charCode & 63) | 128)
        }
    }

    return bytes
}
