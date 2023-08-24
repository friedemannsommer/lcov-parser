import { expect } from 'chai'

import { defaultFieldNames, Variant } from '../constants.js'
import { isEmptyField } from '../lib/field-variant.js'
import { mapFieldName } from '../lib/lookup.js'
import { LcovParser } from '../parser.js'
import { FieldNames } from '../typings/options.js'

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
            }

            parser.write(Buffer.from(chunk))

            const result = parser.flush()

            expect(result).to.have.length(2)

            expect(result[0]).to.eql({
                done: false,
                incomplete: false,
                value: isEmptyFieldVariant ? null : ['test', 'data'],
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
    it('should not parse chunk without trailing newline', (): void => {
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

    it('should parse chunk with trailing newline', (): void => {
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

        expect(result).to.have.length(2)

        expect(result[0]).to.eql({
            done: false,
            incomplete: false,
            value: ['example'],
            variant: Variant.TestName
        })

        expect(result[1]).to.eql({
            done: true,
            incomplete: false,
            value: null,
            variant: Variant.None
        })
    })
})
