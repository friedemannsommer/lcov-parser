# @friedemannsommer/lcov-parser

## 5.0.2

### Patch Changes

- [`7d8fc3f`](https://github.com/friedemannsommer/lcov-parser/commit/7d8fc3fc77f81669bdc968d98c55d03bde79dc20) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Separated ESM and CJS typings in package config.
  This _should_ resolve the CJS declaration mix up issues when trying to default import from this package in an ESM environment (see [`allowSyntheticDefaultImports`](https://www.typescriptlang.org/tsconfig/#allowSyntheticDefaultImports)).

## 5.0.1

### Patch Changes

- [`3e2a902`](https://github.com/friedemannsommer/lcov-parser/commit/3e2a902c1a79594d81106615a1737ab0102463fa) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Updated [`Sync.Options`](https://friedemannsommer.github.io/lcov-parser/v5.0.0/interfaces/sync.Options.html#from) to allow `ArrayBuffer` as well as `SharedArrayBuffer`.

## 5.0.0

### Major Changes

- [#280](https://github.com/friedemannsommer/lcov-parser/pull/280) [`4bb7148`](https://github.com/friedemannsommer/lcov-parser/commit/4bb71487260b9d9a0452ce0d050218007dbbc968) Thanks [@C2thehris](https://github.com/C2thehris)! - Support the new [Function Coverage format](https://github.com/linux-test-project/lcov/blob/5186f7394417292537d17b9a9a30f8c06bedc16c/man/geninfo.1#L1418) defined by LCOV 2.2.

## 4.0.4

### Patch Changes

- [`49a37c2`](https://github.com/friedemannsommer/lcov-parser/commit/49a37c2981c45de3f0f63ceab409462e7d814ba6) Thanks [@friedemannsommer](https://github.com/friedemannsommer)! - Optimize parser performance

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
