import { List } from './lib/list.js'
import { FieldNames } from './typings/options.js'
import { generateFieldLookup } from './lib/lookup.js'
import ByteMatch from './lib/byte-match.js'
import { Variant } from './constants.js'

export interface ParseResult {
    done: boolean
    incomplete: boolean
    value: string[] | null
    variant: Variant
}

interface ParseValueResult {
    index: number
    value: string[]
}

export class LcovParser {
    private _buffer: Buffer | null = null
    private _offset: number = 0
    private readonly _chunks = new List<Buffer>()
    private readonly _variants: Variant[]
    private readonly _fieldNames: ByteMatch[]

    public constructor(fieldNames: FieldNames) {
        const [labels, names] = generateFieldLookup(fieldNames)

        this._variants = labels
        this._fieldNames = names
    }

    public write(chunk: Buffer): void {
        this._chunks.insert(chunk)
    }

    public read(): ParseResult {
        if (this._buffer === null) {
            if (this._chunks.size() === 0) {
                return {
                    done: true,
                    incomplete: false,
                    value: null,
                    variant: Variant.None
                }
            }

            this._buffer = this._chunks.remove()
        } else if (this._offset >= this._buffer.byteLength) {
            return {
                done: true,
                incomplete: false,
                value: null,
                variant: Variant.None
            }
        }

        let result = this._parseResult(this._buffer!)

        while (result.incomplete && this._chunks.size() !== 0) {
            this._buffer = Buffer.concat([this._buffer!.subarray(this._offset), this._chunks.remove()!])
            result = this._parseResult(this._buffer)
        }

        return result
    }

    public flush(): ParseResult[] {
        let result = this.read()
        const parseResults: ParseResult[] = [result]

        while (!result.done) {
            result = this.read()
            parseResults.push(result)
        }

        return parseResults
    }

    private _parseResult(buf: Buffer): ParseResult {
        const length = buf.byteLength

        for (let byteIndex = this._offset; byteIndex < length; byteIndex++) {
            const byte = buf[byteIndex]

            for (let nameIndex = 0; nameIndex < this._fieldNames.length; nameIndex++) {
                const matcher = this._fieldNames[nameIndex]

                if (matcher.compare(byte) && matcher.matched()) {
                    const variant = this._variants[nameIndex]
                    const nonEmptyField = variant !== Variant.EndOfRecord

                    if (nonEmptyField && byteIndex + 1 < length && buf[byteIndex + 1] !== 58 /* ':' (colon) */) {
                        continue
                    }

                    const result = nonEmptyField ? LcovParser._parseValue(buf, byteIndex + 1) : null
                    let value = null

                    if (result !== null) {
                        this._offset = result.index + 1
                        value = result.value
                    } else if (!nonEmptyField) {
                        this._offset += matcher.size
                    }

                    this._resetMatcher()

                    return {
                        done: false,
                        value,
                        variant,
                        incomplete: nonEmptyField && result === null
                    }
                }
            }
        }

        return {
            done: false,
            incomplete: true,
            value: null,
            variant: Variant.None
        }
    }

    private _resetMatcher(): void {
        for (const matcher of this._fieldNames) {
            matcher.reset()
        }
    }

    private static _parseValue(buf: Buffer, offset: number): ParseValueResult | null {
        let start = -1

        for (let index = offset; index < buf.byteLength; index++) {
            switch (buf[index]) {
                case 58 /* ':' (colon) */:
                    start = index + 1
                    break
                case 10 /* '\n' (newline) */:
                    if (start === -1) {
                        return null
                    }

                    return {
                        index,
                        value: LcovParser._parseSlice(buf, start, index)
                    }
            }
        }

        return null
    }

    private static _parseSlice(buf: Buffer, start: number, end: number): string[] {
        const values: string[] = []
        let offset = start

        for (let index = start; index < end; index++) {
            if (buf[index] === 44) {
                values.push(buf.subarray(offset, index).toString())
                offset = index + 1
            }
        }

        values.push(buf.subarray(offset, end).toString())

        return values
    }
}
