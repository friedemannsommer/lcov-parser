# LCOV parser

A LCOV file parser, written in TypeScript.

[![npm](https://img.shields.io/npm/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=npm)][npm]
[![CI](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/friedemannsommer/lcov-parser/graph/badge.svg?token=DXR26JEVQC)](https://codecov.io/gh/friedemannsommer/lcov-parser)
![node-current](https://img.shields.io/node/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=nodedotjs)
![node-lts](https://img.shields.io/node/v-lts/%40friedemannsommer%2Flcov-parser?style=flat&logo=nodedotjs)

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

`string` data

```typescript
import lcovParser from "@friedemannsommer/lcov-parser"

const sections = await lcovParser({from: "<LCOV data>"})
```

`Buffer` / `ArrayBuffer`

```typescript
import lcovParser from "@friedemannsommer/lcov-parser"

const sections = await lcovParser({from: Buffer.from("<LCOV data>")})
```

[`Readable`][readable] streams

```typescript
import lcovParser from "@friedemannsommer/lcov-parser"
import {createReadStream} from "node:fs"

const lcovFile = createReadStream(new URL("path/to/lcov.info", import.meta.url))
const sections = await lcovParser({from: lcovFile})
```

For more details, take a look at the documentation,
which can be found here: [friedemannsommer.github.io/lcov-parser][package-docs].

[lcov-format]: https://github.com/linux-test-project/lcov/blob/3decc12ab1e7b34d2860393e2f40f0e1057d5c16/man/geninfo.1#L989-L1171

[npm]: https://www.npmjs.com/package/@friedemannsommer/lcov-parser

[readable]: https://nodejs.org/api/stream.html#readable-streams

[package-docs]: https://friedemannsommer.github.io/lcov-parser/
