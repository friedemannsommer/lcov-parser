export function parseInteger(val: string): number {
    const num = parseInt(val)

    if (isNaN(num)) {
        return 0
    }

    return num
}
