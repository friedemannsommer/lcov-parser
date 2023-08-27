import { expect } from 'chai'

import { encode } from '../lib/utf-8.js'

describe('UTF-8 encode', (): void => {
    const testData: Array<[string, number[]]> = [
        ['Hello World', [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]],
        ['你好，世界', [228, 189, 160, 229, 165, 189, 239, 188, 140, 228, 184, 150, 231, 149, 140]],
        [
            'Γεια σου κόσμε',
            [
                206, 147, 206, 181, 206, 185, 206, 177, 32, 207, 131, 206, 191, 207, 133, 32, 206, 186, 207, 140, 207,
                131, 206, 188, 206, 181
            ]
        ],
        [
            'ハロー・ワールド',
            [
                227, 131, 143, 227, 131, 173, 227, 131, 188, 227, 131, 187, 227, 131, 175, 227, 131, 188, 227, 131, 171,
                227, 131, 137
            ]
        ],
        ['헬로 월드', [237, 151, 172, 235, 161, 156, 32, 236, 155, 148, 235, 147, 156]],
        [
            'Привіт, світ.',
            [
                208, 159, 209, 128, 208, 184, 208, 178, 209, 150, 209, 130, 44, 32, 209, 129, 208, 178, 209, 150, 209,
                130, 46
            ]
        ],
        ['🏳️‍🌈', [240, 159, 143, 179, 239, 184, 143, 226, 128, 141, 240, 159, 140, 136]]
    ]

    for (const [str, expected] of testData) {
        it(`should correctly encode "${str}"`, (): void => {
            expect(encode(str)).to.eql(expected)
        })
    }
})
