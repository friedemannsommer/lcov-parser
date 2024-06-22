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
