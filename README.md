# LCOV parser

A fast, zero-dependency parser for LCOV coverage reports, written in TypeScript for Node.js, with ESM/CommonJS
support and a streaming API.

[![npm](https://img.shields.io/npm/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=npm)][npm]
[![CI](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/friedemannsommer/lcov-parser/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/friedemannsommer/lcov-parser/graph/badge.svg?token=DXR26JEVQC)](https://codecov.io/gh/friedemannsommer/lcov-parser)
![node-current](https://img.shields.io/node/v/%40friedemannsommer%2Flcov-parser?style=flat&logo=nodedotjs)

> This parser is built for the LCOV trace file format, which can be found
> here: [github.com/linux-test-project/lcov/man/geninfo.1][lcov-format].
>
> You're able to use different field names, if necessary.

## Why this parser?

|               | [`lcov-parse`][lcov-parse-npmx]                        | [`parse-lcov`][parse-lcov-npmx] | **`@friedemannsommer/lcov-parser`**                  |
| ------------- | ------------------------------------------------------ | ------------------------------- | ---------------------------------------------------- |
| Last updated  | 2017                                                   | 2020                            | 2026                                                 |
| LCOV version  | 1.x (legacy)                                           | 1.x (legacy)                    | up to 2.2                                            |
| TypeScript    | No (community [`@types/lcov-parse`][types-lcov-parse]) | Yes (native)                    | Yes (native)                                         |
| Module format | CommonJS only                                          | CommonJS only                   | ESM + CommonJS (dual package)                        |
| Dependencies  | 0                                                      | 0                               | 0                                                    |
| Input types   | `string` (file path or content)                        | `string`                        | `string`, `Buffer`, `ArrayBuffer`, `Readable` stream |
| API style     | callback                                               | sync                            | sync, promise, stream                                |

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
import lcovParser from "@friedemannsommer/lcov-parser/sync";

const sections = lcovParser({ from: "<LCOV data>" });
```

[`Buffer`][buffer-docs] / [`ArrayBuffer`][array-buffer-docs]

```typescript
import lcovParser from "@friedemannsommer/lcov-parser/sync";

const sections = lcovParser({ from: Buffer.from("<LCOV data>") });
```

[`Readable`][readable-docs] streams

```typescript
import lcovParser from "@friedemannsommer/lcov-parser";
import { createReadStream } from "node:fs";

const lcovFile = createReadStream(new URL("path/to/lcov.info", import.meta.url));
const sections = await lcovParser({ from: lcovFile });
```

For more details, take a look at the documentation,
which can be found here: [friedemannsommer.github.io/lcov-parser][package-docs].

[array-buffer-docs]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
[buffer-docs]: https://nodejs.org/api/buffer.html#class-buffer
[lcov-format]: https://github.com/linux-test-project/lcov/blob/751a06367107e0134c8bce2ea1b89e1f8d10ea35/man/geninfo.1#L1479-L1784
[lcov-parse-npmx]: https://npmx.dev/package/lcov-parse
[lcov-parser-npmx]: https://npmx.dev/package/@friedemannsommer/lcov-parser
[npm]: https://www.npmjs.com/package/@friedemannsommer/lcov-parser
[package-docs]: https://friedemannsommer.github.io/lcov-parser/
[parse-lcov-npmx]: https://npmx.dev/package/parse-lcov
[readable-docs]: https://nodejs.org/api/stream.html#readable-streams
[string-glossary]: https://developer.mozilla.org/en-US/docs/Glossary/String
[types-lcov-parse]: https://npmx.dev/package/@types/lcov-parse
