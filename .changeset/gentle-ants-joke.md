---
"@friedemannsommer/lcov-parser": patch
---

Separated ESM and CJS typings in package config. This _should_ resolve the default import in an ESM environment (see [`allowSyntheticDefaultImports`](https://www.typescriptlang.org/tsconfig/#allowSyntheticDefaultImports)).
