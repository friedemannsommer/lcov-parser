import { readFileSync, writeFileSync } from 'node:fs'

import { defaultFieldNames } from '../../constants.js'
import { LcovParser } from '../../parser.js'
import lcovParser from '../../promise/index.js'

const exampleDirectory = new URL('../../../example/', import.meta.url)
const lcovBuffer = readFileSync(new URL('./lcov.info', exampleDirectory))
const sections = await lcovParser({ from: lcovBuffer })
const parser = new LcovParser(defaultFieldNames)

parser.write(lcovBuffer)

const parsedNodes = parser.flush()

writeFileSync(new URL('./sections.json', exampleDirectory), JSON.stringify(sections, undefined, 2))
writeFileSync(new URL('./nodes.json', exampleDirectory), JSON.stringify(parsedNodes, undefined, 2))
