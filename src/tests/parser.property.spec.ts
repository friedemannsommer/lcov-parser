import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import fc from 'fast-check'

import { defaultFieldNames, Variant } from '../constants.js'
import { isNonEmptyField } from '../lib/field-variant.js'
import { FIELD_NAME_MAP } from '../lib/lookup.js'
import { LcovParser } from '../parser.js'
import type { FieldNames } from '../typings/options.js'

const lineRecord = fc.tuple(fc.nat({ max: 100_000 }), fc.nat({ max: 1_000 })).map(([line, hit]) => `DA:${line},${hit}`)

const functionRecord = fc
    .tuple(
        fc.nat({ max: 100_000 }),
        fc.nat({ max: 100_000 }),
        fc.string({ minLength: 1, maxLength: 16, unit: 'grapheme-ascii' })
    )
    .map(([line, lineEnd, name]) => `FN:${line},${lineEnd},${name.replace(/[,\n]/g, '_')}`)

const branchRecord = fc
    .tuple(fc.nat({ max: 100_000 }), fc.nat({ max: 100 }), fc.nat({ max: 100 }), fc.nat({ max: 1_000 }))
    .map(([line, block, branch, taken]) => `BRDA:${line},${block},${branch},${taken}`)

const record = fc.oneof(lineRecord, functionRecord, branchRecord)

const section = fc
    .tuple(fc.nat({ max: 100_000 }), fc.array(record, { maxLength: 25 }))
    .map(([id, records]) => [`SF:file_${id}.ts`, ...records, 'end_of_record'].join('\n').concat('\n'))

const document = fc.array(section, { minLength: 1, maxLength: 8 }).map((sections) => sections.join(''))

const corruptibleFields = (Object.keys(defaultFieldNames) as Array<keyof FieldNames>)
    .map((key) => ({ name: defaultFieldNames[key], variant: FIELD_NAME_MAP[key] }))
    .filter(({ variant }) => isNonEmptyField(variant) && variant !== Variant.Comment)

describe('LcovParser - property', (): void => {
    it('produces identical results regardless of how the input is chunked across write() calls', (): void => {
        fc.assert(
            fc.property(
                document,
                fc.array(fc.integer({ min: 1, max: 32 }), { minLength: 1, maxLength: 64 }),
                (doc, cuts): void => {
                    const buffer = Buffer.from(doc, 'utf-8')
                    const chunks: Buffer[] = []
                    let offset = 0
                    let cutIndex = 0

                    while (offset < buffer.byteLength) {
                        const size = cuts[cutIndex % cuts.length]

                        chunks.push(buffer.subarray(offset, offset + size))
                        offset += size
                        cutIndex++
                    }

                    const chunkedParser = new LcovParser(defaultFieldNames)

                    for (const chunk of chunks) {
                        chunkedParser.write(chunk)
                    }

                    const singleParser = new LcovParser(defaultFieldNames)

                    singleParser.write(buffer)

                    assert.deepStrictEqual(chunkedParser.flush(), singleParser.flush())
                }
            )
        )
    })

    it('never throws when fed arbitrary bytes', (): void => {
        fc.assert(
            fc.property(fc.uint8Array({ maxLength: 4_096 }), (bytes): void => {
                const parser = new LcovParser(defaultFieldNames)

                parser.write(Buffer.from(bytes))

                assert.doesNotThrow((): void => {
                    parser.flush()
                })
            })
        )
    })

    it('never throws when fed arbitrary bytes split across many write() calls', (): void => {
        fc.assert(
            fc.property(fc.array(fc.uint8Array({ maxLength: 256 }), { maxLength: 32 }), (chunks): void => {
                const parser = new LcovParser(defaultFieldNames)

                for (const chunk of chunks) {
                    parser.write(Buffer.from(chunk))
                }

                assert.doesNotThrow((): void => {
                    parser.flush()
                })
            })
        )
    })

    it('never matches a field name that has a stray byte inserted into it (BRxH regression)', (): void => {
        fc.assert(
            fc.property(
                fc.constantFrom(...corruptibleFields),
                fc.nat({ max: 1_000 }),
                fc
                    .string({ minLength: 1, maxLength: 1, unit: 'grapheme-ascii' })
                    .filter((char) => char !== ':' && char !== '\n'),
                fc.string({ maxLength: 8 }).filter((value) => !value.includes('\n')),
                (field, positionSeed, wrongChar, value): void => {
                    const insertIndex = 1 + (positionSeed % (field.name.length - 1))
                    const corrupted = field.name.slice(0, insertIndex) + wrongChar + field.name.slice(insertIndex)
                    const parser = new LcovParser(defaultFieldNames)

                    parser.write(Buffer.from(`${corrupted}:${value}\n`))

                    assert.notStrictEqual(parser.read().variant, field.variant)
                }
            )
        )
    })
})
