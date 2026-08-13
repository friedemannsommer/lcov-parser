---
"@friedemannsommer/lcov-parser": minor
---

Updated `BRDA` parsing: the `<block>` field may be prefixed with a `f` (fallthrough) and/or `U` (unreachable) flag, in addition to the already supported `e` (exception) flag. Previously, only the `e` flag was recognized; any other prefix caused the `block` number to be parsed as `0`.

`BranchEntry` (and the underlying `BranchLocationEntry`) now expose `isFallthrough` and `isUnreachable` booleans, alongside the existing `isException`.
