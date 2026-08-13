/**
 * Generates synthetic, but well-formed, LCOV trace file content for benchmarking.
 */
export function generateLcov(sections: number, linesPerSection: number): string {
    const parts: string[] = []

    for (let sectionIndex = 0; sectionIndex < sections; sectionIndex++) {
        parts.push(`TN:suite_${sectionIndex}\n`)
        parts.push(`SF:src/file_${sectionIndex}.ts\n`)

        for (let line = 1; line <= linesPerSection; line++) {
            parts.push(`DA:${line},${line % 3}\n`)

            if (line % 5 === 0) {
                parts.push(`FN:${line},${line + 1},fn_${sectionIndex}_${line}\n`)
                parts.push(`FNDA:${line % 4},fn_${sectionIndex}_${line}\n`)
            }

            if (line % 7 === 0) {
                parts.push(`BRDA:${line},0,0,${line % 2}\n`)
                parts.push(`BRDA:${line},0,1,-\n`)
            }
        }

        parts.push(`FNF:${Math.floor(linesPerSection / 5)}\n`)
        parts.push(`FNH:${Math.floor(linesPerSection / 10)}\n`)
        parts.push(`BRF:${Math.floor((linesPerSection / 7) * 2)}\n`)
        parts.push(`BRH:${Math.floor(linesPerSection / 7)}\n`)
        parts.push(`LF:${linesPerSection}\n`)
        parts.push(`LH:${Math.floor(linesPerSection / 2)}\n`)
        parts.push('end_of_record\n')
    }

    return parts.join('')
}

export function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks: Buffer[] = []

    for (let offset = 0; offset < buffer.byteLength; offset += chunkSize) {
        chunks.push(buffer.subarray(offset, offset + chunkSize))
    }

    return chunks
}
