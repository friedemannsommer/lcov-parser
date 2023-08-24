import { expect } from 'chai'

import ByteMatch from '../lib/byte-match.js'

describe('ByteMatch - buffer size', (): void => {
    for (let bufferSize = 1; bufferSize < 100; bufferSize++) {
        it(`should compare and match a buffer with size ${bufferSize}`, () => {
            const buffer = Array(bufferSize)
                .fill(0)
                .map((_, index) => index)
            const instance = new ByteMatch(buffer)

            expect(instance.size).to.eq(bufferSize)

            for (let index = 0; index < bufferSize; index++) {
                expect(instance.compare(buffer[index])).to.be.true
            }

            expect(instance.matched()).to.be.true
        })
    }
})

describe('ByteMatch - reset', (): void => {
    it('should reset match cursor', () => {
        const buffer = [0, 1, 2]
        const instance = new ByteMatch(buffer)

        expect(instance.compare(0)).to.be.true
        expect(instance.compare(1)).to.be.true

        instance.reset()

        expect(instance.compare(2)).to.be.false
        expect(instance.matched()).to.be.false
    })
})
