import { expect } from 'chai'

import { defaultFieldNames, Variant } from '../constants.js'
import { isEmptyField } from '../lib/field-variant.js'
import { mapFieldName } from '../lib/lookup.js'
import { LcovParser } from '../parser.js'
import { FieldNames } from '../typings/options.js'
import { getParseResult, getRawLcov } from './lib/parse.js'

describe('LcovParser - Field names', (): void => {
    for (const key of Object.keys(defaultFieldNames) as Array<keyof FieldNames>) {
        const fieldName = defaultFieldNames[key]
        const variant = mapFieldName(key)
        const isEmptyFieldVariant = isEmptyField(variant)

        it(`should parse "${fieldName}" (${key})`, (): void => {
            const parser = new LcovParser(defaultFieldNames)
            let chunk = fieldName

            if (!isEmptyFieldVariant) {
                chunk += ':test,data\n'
            } else {
                chunk += '\n'
            }

            parser.write(Buffer.from(chunk))

            const result = parser.flush()

            expect(result).to.have.length(2)

            expect(result[0]).to.eql({
                done: false,
                incomplete: false,
                value: isEmptyFieldVariant ? null : variant === Variant.Comment ? [':test', 'data'] : ['test', 'data'],
                variant
            })

            expect(result[1]).to.eql({
                done: true,
                incomplete: false,
                value: null,
                variant: Variant.None
            })
        })
    }
})

describe('LcovParser - Chunks', (): void => {
    it('should return `done: true` if there are no chunks and buffer available', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const result = parser.read()

        expect(result).to.eql({
            done: true,
            incomplete: false,
            value: null,
            variant: Variant.None
        })
    })

    it('should not parse chunk without trailing new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(defaultFieldNames.testName + ':example'))

        const result = parser.read()

        expect(result).to.eql({
            done: false,
            incomplete: true,
            value: null,
            variant: Variant.TestName
        })
    })

    it('should parse chunk with trailing new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(defaultFieldNames.testName + ':example\n'))

        const result = parser.read()

        expect(result).to.eql({
            done: false,
            incomplete: false,
            value: ['example'],
            variant: Variant.TestName
        })
    })

    it('should parse multiple chunks into one result', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const chunks = [defaultFieldNames.testName, ':', 'example', '\n']

        for (const chunk of chunks) {
            parser.write(Buffer.from(chunk))
        }

        const result = parser.flush()

        expect(result).to.eql([
            {
                done: false,
                incomplete: false,
                value: ['example'],
                variant: Variant.TestName
            },
            {
                done: true,
                incomplete: false,
                value: null,
                variant: Variant.None
            }
        ])
    })
})

describe('LcovParser - Current buffer', (): void => {
    it('should return `null` if no buffer is available', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        expect(parser.getCurrentBuffer()).to.be.null
    })

    it('should return `Buffer` if no buffer is available', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from('not relevant'))
        parser.read()

        expect(Buffer.isBuffer(parser.getCurrentBuffer()), 'isBuffer').to.be.true
    })
})

describe('LcovParser - Comments', (): void => {
    it('should parse comment', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(
            Buffer.from(
                getRawLcov(defaultFieldNames.testName, 'test') +
                    getRawLcov('#' + defaultFieldNames.filePath, 'example.file')
            )
        )

        expect(parser.read()).to.eql(getParseResult(Variant.TestName, ['test']))
        expect(parser.read()).to.eql(getParseResult(Variant.Comment, [defaultFieldNames.filePath + ':example.file']))
        expect(parser.read()).to.eql(getParseResult(Variant.None, null, true))
    })

    it('should return incomplete for comment without new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(
            Buffer.from(
                getRawLcov(defaultFieldNames.testName, 'test') +
                    getRawLcov('#' + defaultFieldNames.filePath, 'example.file').slice(0, -1)
            )
        )

        expect(parser.read()).to.eql(getParseResult(Variant.TestName, ['test']))
        expect(parser.read()).to.eql(getParseResult(Variant.Comment, null, false, true))
    })
})

describe('LcovParser - empty fields', (): void => {
    it('should process "end_of_record" correctly', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord)))

        expect(parser.read()).to.eql(getParseResult(Variant.EndOfRecord))
        expect(parser.read()).to.eql(getParseResult(Variant.None, null, true))
    })

    it('should return incomplete for "end_of_record" without new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord).slice(0, -1)))

        expect(parser.read()).to.eql(getParseResult(Variant.None, null, false, true))
    })
})
