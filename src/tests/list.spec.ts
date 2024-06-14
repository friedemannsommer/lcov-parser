import { expect } from 'chai'

import List from '../lib/list.js'

describe('List', (): void => {
    it('should correctly update `size` on `insert`', (): void => {
        const instance = new List<number>()

        for (let i = 0; i < 100; i++) {
            instance.append(i)
            expect(instance.size()).to.eq(i + 1)
        }
    })

    it('should correctly update `size` on `remove`', (): void => {
        const instance = new List<number>()

        instance.append(0)
        expect(instance.size()).to.eq(1)
        expect(instance.remove()).to.eq(0)
        expect(instance.size()).to.eq(0)
    })

    it('should return `null` if there are no entries', (): void => {
        const instance = new List<undefined>()

        expect(instance.remove()).to.be.null
        expect(instance.peek()).to.be.null
    })

    it('should work in FIFO order', (): void => {
        const instance = new List<number>()

        for (let i = 0; i < 5; i++) {
            instance.append(i)
            expect(instance.peek()).to.eq(0)
        }

        for (let i = 0; i < 5; i++) {
            expect(instance.remove()).to.eq(i)
        }
    })
})
