import { LcovStreamParser } from '../dist/stream/index.mjs'

const EXPECTED_ERROR_MESSAGE = 'unexpected end of input.'

export function fuzz(data) {
    return new Promise((resolve, reject) => {
        const parser = new LcovStreamParser()

        parser.resume()
        parser.once('error', (err) => {
            if (err.message === EXPECTED_ERROR_MESSAGE) {
                resolve()
            } else {
                reject(err)
            }
        })
        parser.once('finish', resolve)
        parser.end(Buffer.from(data))
    })
}
