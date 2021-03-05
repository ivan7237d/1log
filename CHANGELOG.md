# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/ivan7237d/1log/compare/v2.1.4...v3.0.0) (2021-03-05)

### ⚠ BREAKING CHANGES

- iterableIteratorPlugin was renamed to iterablePlugin
- there is more data included in log messages (see new features), so you may need to update Jest snapshots

### Features

- a plugin for logging async iterables ([1144597](https://github.com/ivan7237d/1log/commit/1144597803d72f8a7b8416eced0136a5f98ae657))
- add numbering to 'call' (functionPlugin) and 'next' (iterablePlugin) badges ([1fbc8e7](https://github.com/ivan7237d/1log/commit/1fbc8e74f3351b985497fc2c7e47e340166333ca))
- log value from a generator function's return statement ([589c002](https://github.com/ivan7237d/1log/commit/589c00222729cc642a76bc84c3f6b5878b05bc27))
- more logical badge colors for promises and iterables ([8d4bfdc](https://github.com/ivan7237d/1log/commit/8d4bfdc9ab86ff839435df8bf92e4b12dcecd283))
- shorten the name of the source file displayed by browser in log messages ([ce50b38](https://github.com/ivan7237d/1log/commit/ce50b38138967a3269414341d393094f7b0f7889))
- support for logging async functions ([0ca8ab0](https://github.com/ivan7237d/1log/commit/0ca8ab0da798ba2905d7f4fc911338dc660ff44d))

### Bug Fixes

- potential issue with some bundlers detecting Node's require ([3e99bd1](https://github.com/ivan7237d/1log/commit/3e99bd153ea23aff53f9622fe2bdca44f0cce560))

### [2.1.4](https://github.com/ivan7237d/1log/compare/v2.1.3...v2.1.4) (2021-02-11)

Chore release.

### [2.1.3](https://github.com/ivan7237d/1log/compare/v2.1.2...v2.1.3) (2021-02-08)

### Bug Fixes

- minor fixes in log message formatting ([c24f67f](https://github.com/ivan7237d/1log/commit/c24f67fb3d71ddcdf67dee4b33c11694e5fad45e))

### [2.1.2](https://github.com/ivan7237d/1log/compare/v2.1.1...v2.1.2) (2021-02-08)

Chore release.

### [2.1.1](https://github.com/ivan7237d/1log/compare/v2.1.0...v2.1.1) (2021-02-06)

Chore release.

## [2.1.0](https://github.com/ivan7237d/1log/compare/v2.0.0...v2.1.0) (2021-01-23)

### Features

- avoid proxying values with subtypes ([176685c](https://github.com/ivan7237d/1log/commit/176685c00a4035f84b3b5f384351a646551b996b))

## [2.0.0](https://github.com/ivan7237d/1log/compare/v1.2.0...v2.0.0) (2021-01-22)

### ⚠ BREAKING CHANGES

- plugin API has changed, disablePlugin was removed, installPlugin, SeverityLevel,
  jestSerializer were renamed, iterablePlugin is superceded by iterableIteratorPlugin

### Features

- simplified plugin API ([36e6900](https://github.com/ivan7237d/1log/commit/36e6900eec0b626c904082f05914edf4cbfac0b5))

## [1.2.0](https://github.com/ivan7237d/1log/compare/v1.1.0...v1.2.0) (2021-01-16)

### Features

- when no handlers are installed, disable logging instead of throwing an error ([6862d49](https://github.com/ivan7237d/1log/commit/6862d49c04f91b67addf76123aa3f7e1987a42d8))

## [1.1.0](https://github.com/ivan7237d/1log/compare/v1.0.2...v1.1.0) (2021-01-14)

### Features

- prevent confusing badge numbers when using with React dev mode ([1e26660](https://github.com/ivan7237d/1log/commit/1e266605fba3c2ebb107b7d08dbc4efc3c08d79f))

### [1.0.2](https://github.com/ivan7237d/1log/compare/v1.0.1...v1.0.2) (2021-01-13)

### Bug Fixes

- incorrect output when the number of arguments is other than 1 and a local plugin is present ([1f972e0](https://github.com/ivan7237d/1log/commit/1f972e0b56710394f275d83df0b0647d77b027d4))

### [1.0.1](https://github.com/ivan7237d/1log/compare/v1.0.0...v1.0.1) (2021-01-12)

### Bug Fixes

- add missing exports ([aab2140](https://github.com/ivan7237d/1log/commit/aab2140eedbeddefa2532ffa15a1953dbd57bffd))

## 1.0.0 (2021-01-12)

Initial release.
