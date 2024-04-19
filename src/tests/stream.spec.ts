import { expect } from 'chai'

import { defaultFieldNames } from '../constants.js'
import { createSection } from '../lib/handle-result.js'
import LcovStreamParser from '../stream/index.js'
import type { SectionSummary } from '../typings/file.js'
import { getTestNameEntry } from './lib/entry.js'
import { getRawLcov } from './lib/parse.js'

describe('LcovStreamParser', (): void => {
    it('should parse buffers into section', async (): Promise<void> => {
        const parser = new LcovStreamParser()
        let section: SectionSummary | undefined

        await new Promise<void>((resolve, reject): void => {
            parser.on('data', (result: SectionSummary): void => {
                section = result
            })
            parser.once('error', reject)
            parser.once('finish', resolve)
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.testName, 'test_name')))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord)))
            parser.end()
        })

        expect(section).to.eql(createSection(getTestNameEntry('test_name')))
    })

    it('should parse buffers into multiple sections', async (): Promise<void> => {
        const parser = new LcovStreamParser()
        const sections: SectionSummary[] = []

        await new Promise<void>((resolve, reject): void => {
            parser.on('data', (result: SectionSummary): void => {
                sections.push(result)
            })
            parser.once('error', (err: Error): void => {
                expect(err).to.be.undefined("parser shouldn't have thrown a exception")
                reject(err)
            })
            parser.once('finish', resolve)
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.testName, 'example_1')))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord)))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.testName, 'example_2')))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord)))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.testName, 'example_3')))
            parser.write(Buffer.from(getRawLcov(defaultFieldNames.endOfRecord)))
            parser.end()
        })

        expect(sections).to.eql([
            createSection(getTestNameEntry('example_1')),
            createSection(getTestNameEntry('example_2')),
            createSection(getTestNameEntry('example_3'))
        ])
    })

    it('should try to resolve incomplete parse result, by appending a new line', async (): Promise<void> => {
        const parser = new LcovStreamParser()
        let section: SectionSummary | undefined

        await new Promise<void>((resolve, reject): void => {
            parser.on('data', (result: SectionSummary): void => {
                section = result
            })
            parser.once('error', reject)
            parser.once('finish', resolve)
            parser.write(getRawLcov(defaultFieldNames.testName, 'post_fix'))
            parser.write(`${defaultFieldNames.filePath}:`)
            parser.end()
        })

        // input doesn't end with 'end_of_record', parser shouldn't yield a section
        expect(section).to.be.undefined
    })

    it('should reject buffers, because of eof', async (): Promise<void> => {
        const parser = new LcovStreamParser()
        const error = await new Promise<Error>((resolve, reject): void => {
            parser.once('error', (err: Error): void => {
                resolve(err)
            })
            parser.once('finish', (): void => {
                reject(new Error("stream shouldn't have finished"))
            })
            parser.write(getRawLcov(defaultFieldNames.testName, 'example_1'))
            parser.write(Buffer.from(defaultFieldNames.filePath))
            parser.end()
        })

        expect(error).to.be.instanceof(Error)
        expect(error.message).to.eq('unexpected end of input.')
    })
})
