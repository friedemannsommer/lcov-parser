import { expect } from 'chai'

import { parseInteger } from '../lib/parse.js'

describe('parseInteger', (): void => {
    it('should parse valid single digit input', (): void => {
        expect(parseInteger('1')).to.eq(1)
    })

    it('should parse valid multi digit input', (): void => {
        expect(parseInteger('1111111')).to.eq(1111111)
    })

    it('should fallback to `0` if given a invalid value', (): void => {
        expect(parseInteger('e')).to.eq(0)
    })
})
