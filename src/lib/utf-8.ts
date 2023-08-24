/**
 * source: https://stackoverflow.com/a/18729931
 * @param val - string to be encoded into bytes
 * @returns Array<number> - UTF-8 bytes
 */
export function encode(val: string): number[] {
    const bytes = []

    for (let i = 0; i < val.length; i++) {
        let charCode = val.charCodeAt(i)

        if (charCode < 0x80) {
            bytes.push(charCode)
        } else if (charCode < 0x800) {
            bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f))
        } else if (charCode < 0xd800 || charCode >= 0xe000) {
            bytes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f))
        } else {
            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (val.charCodeAt(++i) & 0x3ff))

            bytes.push(
                0xf0 | (charCode >> 18),
                0x80 | ((charCode >> 12) & 0x3f),
                0x80 | ((charCode >> 6) & 0x3f),
                0x80 | (charCode & 0x3f)
            )
        }
    }

    return bytes
}
