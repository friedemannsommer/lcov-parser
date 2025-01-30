# @friedemannsommer/lcov-parser

## 4.0.3

### Patch Changes

- [`dda3117`](https://github.com/friedemannsommer/lcov-parser/commit/dda3117c04847e2fc2bf2f0094a1b360317c696a) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Replaced UTF-8 encoding implementation with [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)

- [`bb4c033`](https://github.com/friedemannsommer/lcov-parser/commit/bb4c03382d438950bbc4e879bf65bbd3366d8ec8) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Added synchronous implementation to be able to parse an in-memory slice without using `await` or `Promise`

## 4.0.2

### Patch Changes

- [`61ddab5`](https://github.com/friedemannsommer/lcov-parser/commit/61ddab50465f2b72a4a916298ea9e476e613a44f) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Reduced code complexity in `LcovParser` and `ByteMatch`

- [`61ddab5`](https://github.com/friedemannsommer/lcov-parser/commit/61ddab50465f2b72a4a916298ea9e476e613a44f) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Corrected several minor typos and fixed minor grammatical errors

## 4.0.1

### Patch Changes

- [#141](https://github.com/friedemannsommer/lcov-parser/pull/141) [`45856e9`](https://github.com/friedemannsommer/lcov-parser/commit/45856e969d5abdb4aa8ce5c54a49587b9ecbc13a) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Fixed a bug which stripped everything up to the last colon, when parsing field values that contain colons.

## 4.0.0

### Major Changes

- [`0fc8864`](https://github.com/friedemannsommer/lcov-parser/commit/0fc8864db3398ccfb06214e794f86a3543f9ce4b) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - `LcovParser#flush` now returns [`FlushedResults`](https://friedemannsommer.github.io/lcov-parser/development/types/parser.FlushedResults.html) instead of [`ParserResult[]`](https://friedemannsommer.github.io/lcov-parser/development/interfaces/parser.ParseResult.html) to make it clear that there will always be at least one result.
