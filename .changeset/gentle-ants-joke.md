---
"@friedemannsommer/lcov-parser": patch
---

Separated ESM and CJS typings in package config.
This _should_ resolve the CJS declaration mix up issues when trying to default import from this package in an ESM environment (see [`allowSyntheticDefaultImports`](https://www.typescriptlang.org/tsconfig/#allowSyntheticDefaultImports)).
