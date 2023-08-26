import { Transform, TransformCallback } from 'node:stream'

import { defaultFieldNames } from '../constants.js'
import { createSection, FunctionMap, handleResult } from '../lib/handle-result.js'
import transformResult from '../lib/transform-result.js'
import { LcovParser } from '../parser.js'
import { StreamOptions } from '../typings/options.js'

/**
 * A [Transform](https://nodejs.org/api/stream.html#class-streamtransform)
 * stream which accepts `Buffer` chunks as input and outputs {@link SectionSummary} objects.
 */
export class LcovStreamParser extends Transform {
    /**
     * @internal
     */
    private readonly _functionMap: FunctionMap = new Map()
    /**
     * @internal
     */
    private _current = createSection()
    /**
     * @internal
     */
    private _parser: LcovParser

    public constructor(options?: StreamOptions) {
        const { fieldNames, parser, ...streamOpts } = options ?? {}

        super({
            ...streamOpts,
            writableObjectMode: false,
            readableObjectMode: true
        })

        this._parser = parser ?? new LcovParser(fieldNames ?? defaultFieldNames)
    }

    /**
     * @internal
     */
    public _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        if (!Buffer.isBuffer(chunk)) {
            callback(new Error('unexpected chunk type, expected a `Buffer`'))
            return
        }

        if (!LcovStreamParser.supportedEncoding(encoding)) {
            callback(new Error(`received chunk with unsupported encoding (${encoding}).`))
            return
        }

        this._parser.write(chunk)
        this._processResults()

        callback(null)
    }

    /**
     * @internal
     */
    public _flush(callback: TransformCallback): void {
        const results = this._parser.flush()

        if (results[0].incomplete) {
            const buffer = this._parser.getCurrentBuffer()

            if (buffer !== null && buffer.includes(10)) {
                callback(new Error('unexpected end of input'))
                return
            }

            this.write(Buffer.from([10]))

            if (!this._processResults()) {
                callback(new Error('unexpected end of input'))
            }
        } else if (!this._processResults(results)) {
            callback(new Error('unexpected end of input'))
            return
        }

        callback(null)
    }

    /**
     * Accepts a [BufferEncoding](https://nodejs.org/api/buffer.html#buffers-and-character-encodings)
     * as argument and returns whether it is supported by this parser.
     *
     * @param encoding - The encoding to check whether this parser supports it.
     * @returns - Will return `true` if given encoding is supported, `false` otherwise.
     */
    public static supportedEncoding(encoding: BufferEncoding | 'buffer'): boolean {
        return (
            encoding === 'ascii' ||
            encoding === 'utf8' ||
            encoding === 'utf-8' ||
            encoding === 'utf16le' ||
            encoding === 'buffer'
        )
    }

    /**
     * @internal
     */
    private _processResults(results = this._parser.flush()): boolean {
        for (const result of results) {
            if (result.incomplete) {
                return false
            }

            if (result.done) {
                return true
            }

            if (handleResult(transformResult(result), this._functionMap, this._current)) {
                this.push(this._current)
                this._current = createSection()
            }
        }

        return false
    }
}

export { StreamOptions }

export default LcovStreamParser
