---
"@friedemannsommer/lcov-parser": patch
---

Fixed a parsing bug where a malformed field name could be misidentified as a valid one if it shared a prefix with another field and happened to end with the same byte(s) as the real field name (e.g. `BRxH:1,2` being misparsed as a `BRH` (`BranchHit`) entry with value `["1", "2"]`, instead of being treated as unrecognized). Well-formed LCOV input is unaffected.
  