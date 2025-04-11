# LCOV parser

A LCOV file parser, written in TypeScript.

[![npm](https://img.shields.io/npm/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=npm)][npm]
[![CI](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/friedemannsommer/lcov-parser/graph/badge.svg?token=DXR26JEVQC)](https://codecov.io/gh/friedemannsommer/lcov-parser)
![node-current](https://img.shields.io/node/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=nodedotjs)

> This parser is built for the LCOV trace file format, which can be found
> here: [github.com/linux-test-project/lcov/man/geninfo.1][lcov-format].
>
> You're able to use different field names, if necessary.

## Installation

```shell
npm install --save-dev --save-exact @friedemannsommer/lcov-parser
```

or the shorter equivalent:

```shell
npm i -DE @friedemannsommer/lcov-parser
```

## Basic usage

[`string`][string-glossary] data

```typescript
import lcovParser from "@friedemannsommer/lcov-parser/sync"

const sections = lcovParser({ from: "<LCOV data>" })
```

[`Buffer`][buffer-docs] / [`ArrayBuffer`][array-buffer-docs]

```typescript
import lcovParser from "@friedemannsommer/lcov-parser/sync"

const sections = lcovParser({ from: Buffer.from("<LCOV data>") })
```

[`Readable`][readable-docs] streams

```typescript
import lcovParser from "@friedemannsommer/lcov-parser"
import {createReadStream} from "node:fs"

const lcovFile = createReadStream(new URL("path/to/lcov.info", import.meta.url))
const sections = await lcovParser({ from: lcovFile })
```

For more details, take a look at the documentation,
which can be found here: [friedemannsommer.github.io/lcov-parser][package-docs].

[array-buffer-docs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer

[buffer-docs]: https://nodejs.org/api/buffer.html#class-buffer

[lcov-format]: https://github.com/linux-test-project/lcov/blob/5186f7394417292537d17b9a9a30f8c06bedc16c/man/geninfo.1#L1370-L1675

[npm]: https://www.npmjs.com/package/@friedemannsommer/lcov-parser

[package-docs]: https://friedemannsommer.github.io/lcov-parser/

[readable-docs]: https://nodejs.org/api/stream.html#readable-streams

[string-glossary]: https://developer.mozilla.org/en-US/docs/Glossary/String
