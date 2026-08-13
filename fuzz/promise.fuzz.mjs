import lcovParser from '../dist/promise/index.mjs'

export async function fuzz(data) {
    await lcovParser({ from: Buffer.from(data) })
}
