# Contributing to the "LCOV parser" package

We welcome contributions from everyone in the form of suggestions, bug
reports, pull requests, and feedback. This document contains some guidance if you
would like to help us.

## Submitting bug reports and feature requests

When reporting a bug or asking for help, please include enough details so that
the people helping you can reproduce the behavior you are seeing. Helpful information includes
(but is not limited to): Node.js version, package version, and if possible, a snippet of
the LCOV file which fails.

When making a feature request, please make it clear what problem you intend to
solve with the feature, any ideas for how this package could support solving that problem and
if possible, alternatives and drawbacks.

## Running the test suite

We encourage you to check that the tests pass locally before submitting a
pull request with your changes. If anything does not pass, it will be easier to
debug, iterate, and fix locally than waiting for the CI servers.

```shell
npm run test
```

### Check types and emit compilation output to "dist" directory

```shell
npm run build
```

### Check types, formatting, and lints

```shell
npm run check
```

### Check types

```shell
npm run check:ts
```

## Running the lints

This project uses [Biome](https://github.com/biomejs/biome) to keep the code style somewhat similar across all files.
Please check that your changes pass these lints locally before submitting a pull request with your changes.
We recognize that this is not a solution that will work correctly in every situation and that there may be situations
where these tools cause errors.

### Biome (lints, formatting)

```shell
npm run check:biome
```

## Property-based tests

Alongside the example-based tests in `src/tests/**/*.spec.ts`, some entrypoints also have `*.property.spec.ts`
counterparts that use [fast-check](https://fast-check.dev/) to assert invariants (e.g. "chunking the same input
 differently across `write()` calls never changes the parsed result", "arbitrary bytes never throw") across many
randomly generated inputs instead of a handful of fixed examples. These run as part of the normal `npm run test` /
`npm run coverage` commands, no separate command is needed.

If a property test fails, fast-check prints a shrunk counterexample and a seed. Reproduce it directly with:

```shell
node --import tsx --test src/tests/<file>.property.spec.ts
```

## Benchmarking

This project uses [tinybench](https://github.com/tinylibs/tinybench) for performance benchmarks. Benchmarks live in
`bench/` and are not part of the test suite or CI, they're a tool for evaluating the performance impact of a change
locally.

```shell
npm run bench
```

When comparing before/after numbers for a change, run the benchmark on the same machine, ideally with nothing else
running, and compare relative differences between tasks rather than absolute ops/sec (see tinybench's
[FAQ](https://github.com/tinylibs/tinybench/blob/master/FAQ.md) for why).

## Fuzz testing

This project uses [Jazzer.js](https://github.com/CodeIntelligenceTesting/jazzer.js), a coverage-guided fuzzer, to
search for inputs that crash or hang one of the four main entrypoints: the low-level `LcovParser` (`fuzz/parser.fuzz.mjs`),
and the `sync`, `promise`, and `stream` entrypoints (`fuzz/sync.fuzz.mjs`, `fuzz/promise.fuzz.mjs`,
`fuzz/stream.fuzz.mjs`). A small seed corpus for each lives in `fuzz/corpus/<name>`.

Jazzer.js instruments code for coverage feedback by loading it through its own module loader, so it can only
instrument plain JavaScript, not TypeScript directly. This means fuzz targets import from the built `dist` output
rather than `src`, and need a build first:

```shell
npm run build
```

After building, run the fuzz targets with:

```shell
npm run fuzz:parser
npm run fuzz:promise
npm run fuzz:stream
npm run fuzz:sync
```

Any input that triggers a genuine bug gets saved into that target's `fuzz/corpus/<name>` directory and should be
committed, so it acts as a regression test. To replay the current corpus without fuzzing:

```shell
npm run fuzz:regression
```

Note that Jazzer.js only flags inputs that throw, reject, or hang - it has no notion of "the parsed result is
wrong". Catching silently-incorrect output is what the example-based and property-based tests are for.
