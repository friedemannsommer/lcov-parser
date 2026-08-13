---
"@friedemannsommer/lcov-parser": major
---

Added support for [MC/DC coverage](https://github.com/linux-test-project/lcov/blob/master/docs/man/geninfo.rst) (`MCDC`, `MCF`, `MCH` records), which was previously silently dropped while parsing.

**Breaking changes:**

- `FieldNames` now requires `mcdcHit`, `mcdcInstrumented`, and `mcdcLocation` field names. `defaultFieldNames` already provides sensible defaults (`MCH`, `MCF`, `MCDC` respectively), but custom `FieldNames` objects may need to be updated.
- `SectionSummary` now includes an `mcdc` field.
