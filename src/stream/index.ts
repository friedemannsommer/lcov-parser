import { Transform, type TransformCallback } from 'node:stream'

import { defaultFieldNames } from '../constants.js'
import { type FunctionIndexMap, type FunctionMap, createSection, handleResult } from '../lib/handle-result.js'
import { isBlankSpace } from '../lib/parse.js'
import transformResult from '../lib/transform-result.js'
import { type FlushedResults, LcovParser } from '../parser.js'
import type { SectionSummary } from '../typings/file.js'
import type { StreamOptions } from '../typings/options.js'

/**
 * A [Transform](https://nodejs.org/api/stream.html#class-streamtransform)
 * stream which accepts `Buffer` chunks as input and outputs {@link SectionSummary} objects.
 */
export class LcovStreamParser extends Transform {
    /**
     * @internal
     */
    private readonly _functionIndices: FunctionIndexMap = new Map()
    /**
     * @internal
     */
    private readonly _functionMap: FunctionMap = new Map()
    /**
     * @internal
     */
    private _current: SectionSummary = createSection()
    /**
     * @internal
     */
    private _parser: LcovParser

    public constructor(options?: StreamOptions) {
        const { fieldNames, parser, ...streamOpts } = options ?? {}

        super({
            ...streamOpts,
            decodeStrings: true,
            readableObjectMode: true,
            writableObjectMode: false
        })

        this._parser = parser ?? new LcovParser(fieldNames ?? defaultFieldNames)
    }

    /**
     * @internal
     */
    public _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
        if (!LcovStreamParser.supportedEncoding(encoding)) {
            callback(new Error(`received chunk with unsupported encoding (${encoding}).`))
            return
        }

        this._parser.write(chunk)
        this._processResults(this._parser.flush())

        callback()
    }

    /**
     * @internal
     */
    public _flush(callback: TransformCallback): void {
        const results = this._parser.flush()

        if (results[0].incomplete) {
            const buffer = this._parser.getCurrentBuffer()

            if (buffer !== null && !LcovStreamParser._isTrailingBlankSpace(buffer)) {
                // write a trailing newline to ensure that the last line can be processed
                this._parser.write(Buffer.from([10]))

                if (!this._processResults(this._parser.flush())) {
                    callback(new Error('unexpected end of input.'))
                    return
                }
            }
        } else if (!this._processResults(results)) {
            callback(new Error('unexpected end of input.'))
            return
        }

        callback()
    }

    /**
     * Accepts a [BufferEncoding](https://nodejs.org/api/buffer.html#buffers-and-character-encodings)
     * as an argument and returns whether it is supported by this parser.
     *
     * @param encoding - The encoding to check whether this parser supports it.
     * @returns - Will return `true` if given encoding is supported, `false` otherwise.
     */
    public static supportedEncoding(encoding: BufferEncoding | 'buffer'): boolean {
        return encoding === 'ascii' || encoding === 'utf8' || encoding === 'utf-8' || encoding === 'buffer'
    }

    /**
     * @internal
     */
    private _processResults(results: FlushedResults): boolean {
        for (const result of results) {
            if (result.incomplete) {
                return false
            }

            if (result.done) {
                return true
            }

            if (handleResult(transformResult(result), this._functionIndices, this._functionMap, this._current)) {
                this.push(this._current)
                this._current = createSection()
            }
        }

        return false
    }

    /**
     * @internal
     */
    private static _isTrailingBlankSpace(buffer: Buffer): boolean {
        for (let i = 0; i < buffer.byteLength; i++) {
            if (!isBlankSpace(buffer[i])) {
                return false
            }
        }

        return true
    }
}

export type { StreamOptions }

export default LcovStreamParser
