import { Variant } from './constants.js'
import { isNonEmptyField } from './lib/field-variant.js'
import List from './lib/list.js'
import { type FieldOptions, generateFieldLookup } from './lib/lookup.js'
import type { FieldNames } from './typings/options.js'

/**
 * A list of {@link ParseResult}s that have been flushed from the parser.
 * This typing is used to make it clear that there will always be at least one result.
 * @see {@link LcovParser#flush}
 */
export type FlushedResults = [ParseResult, ...ParseResult[]]

/**
 * A parsed LCOV field entry.
 * It may be incomplete, check the {@link ParseResult#done} and {@link ParseResult#incomplete} fields.
 */
export interface ParseResult<V extends Variant = Variant> {
    /**
     * Signals that this is the last entry.
     */
    done: boolean
    /**
     * Signals that there wasn't enough data to successfully parse the current buffer
     * and more data is necessary to parse it successfully.
     */
    incomplete: boolean
    /**
     * A list of string values which were present after the `:` (colon) separator, or `null`
     * if the current variant shouldn't have values.
     */
    value: string[] | null
    /**
     * Variant of the current field entry. See {@link Variant} for more information.
     */
    variant: V
}

interface ParseValueResult {
    lastIndex: number
    value: string[]
}

const newLineChar = 10 /* UTF-8 `\n` */
const colonChar = 58 /* ':' (colon) */
const commaChar = 44 /* ',' (comma) */

/**
 * Parses the given chunks based on the provided {@link FieldNames}.
 * Please note that a {@link LcovParser#write} call doesn't imply any parsing,
 * call the {@link LcovParser#read} or {@link LcovParser#flush} functions to parse the given chunks.
 */
export class LcovParser {
    /**
     * @internal
     */
    private _buffer: Buffer | null = null
    /**
     * @internal
     */
    private _offset = 0
    /**
     * @internal
     */
    private readonly _chunks = new List<Buffer>()
    /**
     * @internal
     */
    private readonly _fields: FieldOptions[]
    private readonly _fieldsLength: number

    public constructor(fieldNames: FieldNames) {
        this._fields = generateFieldLookup(fieldNames)
        this._fieldsLength = this._fields.length
    }

    /**
     * @internal
     */
    private static _parseValue(buf: Buffer, offset: number): ParseValueResult | null {
        const endOfLineIndex = buf.indexOf(newLineChar, offset)

        if (endOfLineIndex !== -1) {
            return {
                lastIndex: endOfLineIndex,
                value: LcovParser._parseSlice(buf, offset, endOfLineIndex)
            }
        }

        return null
    }

    /**
     * @internal
     */
    private static _parseSlice(buf: Buffer, start: number, end: number): string[] {
        const values: string[] = []
        let offset = start

        for (let index = start; index < end; index++) {
            if (buf[index] === commaChar) {
                values.push(buf.toString('utf-8', offset, index))
                offset = index + 1
            }
        }

        values.push(buf.toString('utf-8', offset, end))

        return values
    }

    /**
     * @internal
     */
    private static _defaultResult(done: boolean, incomplete: boolean): ParseResult {
        return {
            done,
            incomplete,
            value: null,
            variant: Variant.None
        }
    }

    /**
     * Add the `chunk` to the list of chunks that should be parsed.
     * @param chunk - A `Buffer` with UTF-8 encoding
     */
    public write(chunk: Buffer): void {
        this._chunks.append(chunk)
    }

    /**
     * Try to parse a result, this may fail if there is no or insufficient data.
     * Check the `done` and `incomplete` fields for `false` values.
     */
    public read(): ParseResult {
        if (this._buffer === null) {
            if (this._chunks.size() === 0) {
                return LcovParser._defaultResult(true, false)
            }

            this._buffer = this._chunks.remove()
        } else if (this._offset >= this._buffer.byteLength) {
            if (this._chunks.size() === 0) {
                return LcovParser._defaultResult(true, false)
            }

            this._buffer = this._chunks.remove()
            this._offset = 0
        }

        // biome-ignore lint/style/noNonNullAssertion: the buffer is guaranteed to exist (see conditions above)
        let result = this._parseResult(this._buffer!)

        while (result.incomplete && this._chunks.size() !== 0) {
            // biome-ignore lint/style/noNonNullAssertion: it is already established that the buffer exists and the while condition ensures that a chunk exists
            this._buffer = Buffer.concat([this._buffer!.subarray(this._offset), this._chunks.remove()!])
            this._offset = 0
            result = this._parseResult(this._buffer)
        }

        return result
    }

    /**
     * Try to parse as many results as possible with the currently available chunks.
     */
    public flush(): FlushedResults {
        let result = this.read()
        const parseResults: FlushedResults = [result]

        while (!result.done && !result.incomplete) {
            result = this.read()
            parseResults.push(result)
        }

        return parseResults
    }

    /**
     * @returns Buffer - If there is a buffer available returns the remaining slice of it, otherwise returns `null`.
     */
    public getCurrentBuffer(): Buffer | null {
        if (this._buffer && this._offset < this._buffer.byteLength) {
            return this._buffer.subarray(this._offset)
        }

        return null
    }

    /**
     * @internal
     */
    private _parseResult(buf: Buffer): ParseResult {
        const length = buf.byteLength

        for (let byteIndex = this._offset; byteIndex < length; byteIndex++) {
            const field = this._matchFields(buf, byteIndex)

            if (field !== null) {
                return field
            }
        }

        this._resetMatcher()

        return LcovParser._defaultResult(false, true)
    }

    /**
     * @internal
     */
    private _matchFields(buf: Buffer, byteIndex: number): ParseResult | null {
        const byte = buf[byteIndex]
        const bufLength = buf.byteLength

        for (let nameIndex = 0; nameIndex < this._fieldsLength; nameIndex++) {
            const field = this._fields[nameIndex]

            if (field.matcher.compare(byte) && field.matcher.matched()) {
                const variant = field.variant
                const nonEmptyField = isNonEmptyField(variant)
                const isComment = variant === Variant.Comment

                if (
                    nonEmptyField &&
                    !isComment /* comments aren't required to contain a ':' (colon) */ &&
                    byteIndex + 1 < bufLength &&
                    buf[byteIndex + 1] !== colonChar
                ) {
                    continue
                }

                // if the current field is a comment, offset the current index by one
                // (so that it points to the value just after the field token).
                // for any other non-empty field, we've already checked that the next value is a colon,
                // so we can offset the index by two.
                const result = nonEmptyField ? LcovParser._parseValue(buf, byteIndex + (isComment ? 1 : 2)) : null
                let value = null

                if (result !== null) {
                    this._offset = result.lastIndex + 1
                    value = result.value
                } else if (!nonEmptyField) {
                    const newLineIndex = buf.indexOf(newLineChar, byteIndex + 1)

                    if (newLineIndex !== -1) {
                        this._offset = newLineIndex + 1
                    } else {
                        return LcovParser._defaultResult(false, true)
                    }
                }

                this._resetMatcher()

                return {
                    done: false,
                    incomplete: nonEmptyField && result === null,
                    value,
                    variant
                }
            }
        }

        return null
    }

    /**
     * @internal
     */
    private _resetMatcher(): void {
        for (let index = 0; index < this._fieldsLength; index++) {
            this._fields[index].matcher.reset()
        }
    }
}
