---
"@friedemannsommer/lcov-parser": major
---

`LcovParser#flush` now returns [`FlushedResults`](https://friedemannsommer.github.io/lcov-parser/development/types/parser.FlushedResults.html) instead of [`ParserResult[]`](https://friedemannsommer.github.io/lcov-parser/development/interfaces/parser.ParseResult.html) to make it clear that there will always be at least one result.