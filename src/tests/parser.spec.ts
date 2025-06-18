import { expect } from 'chai'

import { defaultFieldNames, Variant } from '../constants.js'
import { isEmptyField } from '../lib/field-variant.js'
import { FIELD_NAME_MAP } from '../lib/lookup.js'
import { LcovParser } from '../parser.js'
import type { FieldNames } from '../typings/options.js'
import { getParseResult, getRawLcov } from './lib/parse.js'

describe('LcovParser - Field names', (): void => {
    for (const key of Object.keys(defaultFieldNames) as Array<keyof FieldNames>) {
        const fieldName = defaultFieldNames[key]
        const variant = FIELD_NAME_MAP[key]
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

            expect(parser.flush()).to.eql([
                getParseResult(
                    variant,
                    isEmptyFieldVariant ? null : variant === Variant.Comment ? [':test', 'data'] : ['test', 'data']
                ),
                getParseResult(Variant.None, null, true)
            ])
        })
    }
})

describe('LcovParser - Invalid fields', (): void => {
    for (const key of Object.keys(defaultFieldNames) as Array<keyof FieldNames>) {
        const fieldName = defaultFieldNames[key]
        const variant = FIELD_NAME_MAP[key]

        if (isEmptyField(variant) || variant === Variant.Comment) {
            // these fields either don't have a value, or a value is not required (comments)
            continue
        }

        it(`should return incomplete result for "${fieldName}" (${key})"`, (): void => {
            const parser = new LcovParser(defaultFieldNames)

            parser.write(Buffer.from(`${fieldName}test,data\n`))

            expect(parser.read()).to.eql(getParseResult(Variant.None, null, false, true))
        })
    }
})

describe('LcovParser - Chunks', (): void => {
    it('should return `done: true` if there are no chunks and buffer available', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const result = parser.read()

        expect(result).to.eql(getParseResult(Variant.None, null, true))
    })

    it('should not parse chunk without trailing new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(`${defaultFieldNames.testName}:example`))

        const result = parser.read()

        expect(result).to.eql(getParseResult(Variant.TestName, null, false, true))
    })

    it('should parse chunk with trailing new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(`${defaultFieldNames.testName}:example\n`))

        const result = parser.read()

        expect(result).to.eql(getParseResult(Variant.TestName, ['example']))
    })

    it('should parse multiple chunks into one result', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const chunks = [defaultFieldNames.testName, ':', 'example', '\n']

        for (const chunk of chunks) {
            parser.write(Buffer.from(chunk))
        }

        const result = parser.flush()

        expect(result).to.eql([getParseResult(Variant.TestName, ['example']), getParseResult(Variant.None, null, true)])
    })

    it('should parse multiple chunks into multiple results', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const chunks = [
            defaultFieldNames.testName,
            ':',
            'example',
            '\n',
            defaultFieldNames.version,
            ':',
            '2',
            '\n',
            defaultFieldNames.filePath,
            ':',
            'directory/file.ext',
            '\n'
        ]

        for (const chunk of chunks) {
            parser.write(Buffer.from(chunk))
        }

        const result = parser.flush()

        expect(result).to.eql([
            getParseResult(Variant.TestName, ['example']),
            getParseResult(Variant.Version, ['2']),
            getParseResult(Variant.FilePath, ['directory/file.ext']),
            getParseResult(Variant.None, null, true)
        ])
    })

    it('should parse multiple sections into multiple results', (): void => {
        const parser = new LcovParser(defaultFieldNames)
        const buffer = Buffer.from(
            `${[
                // section #1
                `${defaultFieldNames.testName}:example 1`,
                `${defaultFieldNames.filePath}:file.ext`,
                defaultFieldNames.endOfRecord,
                // section #2
                `${defaultFieldNames.testName}:example 2`,
                `${defaultFieldNames.filePath}:directory/file.ext`,
                defaultFieldNames.endOfRecord
            ].join('\n')}\n`
        )

        parser.write(buffer)

        const result = parser.flush()

        expect(result).to.eql([
            getParseResult(Variant.TestName, ['example 1']),
            getParseResult(Variant.FilePath, ['file.ext']),
            getParseResult(Variant.EndOfRecord, null),
            getParseResult(Variant.TestName, ['example 2']),
            getParseResult(Variant.FilePath, ['directory/file.ext']),
            getParseResult(Variant.EndOfRecord, null),
            getParseResult(Variant.None, null, true)
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
                    getRawLcov(`#${defaultFieldNames.filePath}`, 'example.file')
            )
        )

        expect(parser.read()).to.eql(getParseResult(Variant.TestName, ['test']))
        expect(parser.read()).to.eql(getParseResult(Variant.Comment, [`${defaultFieldNames.filePath}:example.file`]))
        expect(parser.read()).to.eql(getParseResult(Variant.None, null, true))
    })

    it('should return incomplete for comment without new line', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(
            Buffer.from(
                getRawLcov(defaultFieldNames.testName, 'test') +
                    getRawLcov(`#${defaultFieldNames.filePath}`, 'example.file').slice(0, -1)
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

describe('LcovParser - Paths containing colons', (): void => {
    it('should process valid Windows like path', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(
            Buffer.from(
                getRawLcov(
                    defaultFieldNames.filePath,
                    'C:\\Users\\Example\\Documents\\Projects\\example\\src\\example.file'
                )
            )
        )

        expect(parser.read()).to.eql(
            getParseResult(Variant.FilePath, ['C:\\Users\\Example\\Documents\\Projects\\example\\src\\example.file'])
        )
        expect(parser.read()).to.eql(getParseResult(Variant.None, null, true))
    })

    it('should process a path containing multiple colons', (): void => {
        const parser = new LcovParser(defaultFieldNames)

        parser.write(Buffer.from(getRawLcov(defaultFieldNames.filePath, '/this/is/a/path:with:colons')))

        expect(parser.read()).to.eql(getParseResult(Variant.FilePath, ['/this/is/a/path:with:colons']))
        expect(parser.read()).to.eql(getParseResult(Variant.None, null, true))
    })
})
