import { Readable } from 'node:stream'
import { expect } from 'chai'

import { Variant, defaultFieldNames } from '../constants.js'
import { createSection } from '../lib/handle-result.js'
import { transformAsynchronous, transformSynchronous } from '../lib/transform-flow.js'
import { LcovParser } from '../parser.js'
import { getTestNameEntry } from './lib/entry.js'
import { getParseResult, getRawLcov } from './lib/parse.js'

describe('transformSynchronous', (): void => {
    it('should transform parsed values into sections', (): void => {
        expect(
            transformSynchronous([
                getParseResult(Variant.TestName, ['example']),
                getParseResult(Variant.FilePath, ['a/example.file']),
                getParseResult(Variant.EndOfRecord),
                getParseResult(Variant.TestName, ['test']),
                getParseResult(Variant.FilePath, ['b/example.file']),
                getParseResult(Variant.EndOfRecord, null, true)
            ])
        ).to.eql([
            {
                ...createSection(getTestNameEntry('example')),
                path: 'a/example.file'
            },
            {
                ...createSection(getTestNameEntry('test')),
                path: 'b/example.file'
            }
        ])
    })
})

describe('transformAsynchronous', (): void => {
    it('should transform string values into sections', async (): Promise<void> => {
        const parser = new LcovParser(defaultFieldNames)
        const stream = new Readable({ autoDestroy: true })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example_1'))
        stream.push(getRawLcov(defaultFieldNames.filePath, 'path/to/file.ext'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(getRawLcov(defaultFieldNames.testName, 'example_2'))
        stream.push(getRawLcov(defaultFieldNames.filePath, 'path/to/other/file.ext'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(null)

        expect(await transformAsynchronous(parser, stream)).to.eql([
            {
                ...createSection(getTestNameEntry('example_1')),
                path: 'path/to/file.ext'
            },
            {
                ...createSection(getTestNameEntry('example_2')),
                path: 'path/to/other/file.ext'
            }
        ])
    })

    it('should transform Buffer values into section', async (): Promise<void> => {
        const parser = new LcovParser(defaultFieldNames)
        const stream = new Readable({ autoDestroy: true, objectMode: false })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example_1'))
        stream.push(getRawLcov(defaultFieldNames.filePath, 'path/to/file.ext'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(null)

        expect(await transformAsynchronous(parser, stream)).to.eql([
            {
                ...createSection(getTestNameEntry('example_1')),
                path: 'path/to/file.ext'
            }
        ])
    })

    it('should transform string values into section', async (): Promise<void> => {
        const parser = new LcovParser(defaultFieldNames)
        const stream = new Readable({ autoDestroy: true, objectMode: true })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example_1'))
        stream.push(getRawLcov(defaultFieldNames.filePath, 'path/to/file.ext'))
        stream.push(getRawLcov(defaultFieldNames.endOfRecord))
        stream.push(null)

        expect(await transformAsynchronous(parser, stream)).to.eql([
            {
                ...createSection(getTestNameEntry('example_1')),
                path: 'path/to/file.ext'
            }
        ])
    })

    it('should reject with error if stream receives unsupported chunk type', async (): Promise<void> => {
        const parser = new LcovParser(defaultFieldNames)
        const stream = new Readable({
            autoDestroy: false,
            objectMode: true,
            read(): void {}
        })

        stream.push(1)

        try {
            await transformAsynchronous(parser, stream)
            expect(true).to.be.false("the promise should've been rejected")
        } catch (err) {
            expect(err).to.be.instanceof(Error)
            expect((err as Error).message).be.eq('received unsupported chunk type.')
        }
    })

    it('should reject with error if stream emits "error"', async (): Promise<void> => {
        const parser = new LcovParser(defaultFieldNames)
        const stream = new Readable({ autoDestroy: false })

        stream.push(getRawLcov(defaultFieldNames.testName, 'example_1'))
        stream.destroy(new Error('test'))

        try {
            await transformAsynchronous(parser, stream)
            expect(true).to.be.false("the promise should've been rejected")
        } catch (err) {
            expect(err).to.be.instanceof(Error)
            expect((err as Error).message).be.eq('test')
        }
    })
})
