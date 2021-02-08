<!-- README for NPM; the one for GitHub is in .github directory. -->

<!-- The first 3 badges below are just to make NPM's scoring algorithm happy. -->

[![npm version](https://img.shields.io/npm/v/1log.svg?style=flat&color=brightgreen)](https://www.npmjs.com/package/1log)
[![license](https://img.shields.io/npm/l/1log.svg?color=brightgreen)](https://www.npmjs.com/package/1log)
[![downloads](https://img.shields.io/npm/dt/1log.svg?color=brightgreen)](https://www.npmjs.com/package/1log)
[![gzip size](https://badgen.net/bundlephobia/minzip/1log?color=green)](https://bundlephobia.com/result?p=1log)
[![tree shaking](https://badgen.net/bundlephobia/tree-shaking/1log)](https://bundlephobia.com/result?p=1log)
[![types](https://img.shields.io/npm/types/1log?color=brightgreen)](https://www.npmjs.com/package/1log)
[![coverage status](https://coveralls.io/repos/github/ivan7237d/1log/badge.svg?branch=master)](https://coveralls.io/github/ivan7237d/1log?branch=master)

This library provides a function `log` that can be used as the regular `console.log`, but has two superpowers: you can insert it into any expression, as in `f(log(x))`, and it supports plugins. There are plugins for setting severity level, for logging functions, promises, and iterables, for creating snapshots of log messages in Jest tests, and more.

Please refer to the [GitHub README](https://github.com/ivan7237d/1log#readme) for full documentation.
