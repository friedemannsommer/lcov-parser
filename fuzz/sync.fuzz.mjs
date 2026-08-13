import lcovParser from '../dist/sync/index.mjs'

export function fuzz(data) {
    lcovParser({ from: Buffer.from(data) })
}
