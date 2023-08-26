import { Variant } from './constants.js'
import ByteMatch from './lib/byte-match.js'
import { isNonEmptyField } from './lib/field-variant.js'
import { List } from './lib/list.js'
import { generateFieldLookup } from './lib/lookup.js'
import { FieldNames } from './typings/options.js'

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
     * Variant fo the current field entry. See {@link Variant} for more information.
     */
    variant: V
}

interface ParseValueResult {
    lastIndex: number
    value: string[]
}

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
    private _offset: number = 0
    /**
     * @internal
     */
    private readonly _chunks = new List<Buffer>()
    /**
     * @internal
     */
    private readonly _variants: Variant[]
    /**
     * @internal
     */
    private readonly _fieldNames: ByteMatch[]

    public constructor(fieldNames: FieldNames) {
        const [labels, names] = generateFieldLookup(fieldNames)

        this._variants = labels
        this._fieldNames = names
    }

    /**
     * Add the `chunk` to the list of chunks that should be parsed.
     * @param chunk - A `Buffer` with UTF-8 encoding
     */
    public write(chunk: Buffer): void {
        this._chunks.insert(chunk)
    }

    /**
     * Try to parse a result, this may fail if there's no or insufficient data.
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

        let result = this._parseResult(this._buffer!)

        while (result.incomplete && this._chunks.size() !== 0) {
            this._buffer = Buffer.concat([this._buffer!.subarray(this._offset), this._chunks.remove()!])
            result = this._parseResult(this._buffer)
        }

        return result
    }

    /**
     * Try to parse as many results as possible with the currently available chunks.
     */
    public flush(): ParseResult[] {
        let result = this.read()
        const parseResults: ParseResult[] = [result]

        while (!result.done && !result.incomplete) {
            result = this.read()
            parseResults.push(result)
        }

        return parseResults
    }

    /**
     * @returns Buffer - If there's a buffer available returns the remaining slice of it, otherwise returns `null`.
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
            const field = this._matchFields(buf, byteIndex, length)

            if (field !== null) {
                return field
            }
        }

        return LcovParser._defaultResult(false, true)
    }

    /**
     * @internal
     */
    private _matchFields(buf: Buffer, byteIndex: number, length: number): ParseResult | null {
        const byte = buf[byteIndex]

        for (let nameIndex = 0; nameIndex < this._fieldNames.length; nameIndex++) {
            const matcher = this._fieldNames[nameIndex]

            if (matcher.compare(byte) && matcher.matched()) {
                const variant = this._variants[nameIndex]
                const nonEmptyField = isNonEmptyField(variant)

                if (nonEmptyField && byteIndex + 1 < length && buf[byteIndex + 1] !== 58 /* ':' (colon) */) {
                    continue
                }

                const result = nonEmptyField ? this._parseValue(buf, byteIndex + 1) : null
                let value = null

                if (result !== null) {
                    this._offset = result.lastIndex + 1
                    value = result.value
                } else if (!nonEmptyField) {
                    this._offset += matcher.size
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
        for (const matcher of this._fieldNames) {
            matcher.reset()
        }
    }

    /**
     * @internal
     */
    private _parseValue(buf: Buffer, offset: number): ParseValueResult | null {
        const length = buf.byteLength
        let start = -1

        for (let index = offset; index < length; index++) {
            switch (buf[index]) {
                case 58 /* ':' (colon) */:
                    start = index + 1
                    break
                case 10 /* '\n' (newline) */:
                    if (start === -1) {
                        return null
                    }

                    return {
                        lastIndex: index,
                        value: LcovParser._parseSlice(buf, start, index)
                    }
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
            if (buf[index] === 44 /* ',' (comma) */) {
                values.push(buf.subarray(offset, index).toString())
                offset = index + 1
            }
        }

        values.push(buf.subarray(offset, end).toString())

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
}
