# 1log

WIP.

## Installation

```bash
npm install @1log/core
```

or

```bash
yarn add @1log/core
```

or

```bash
pnpm add @1log/core
```

## Philosophy

Say you want to build a "plugin" that customizes `console.log` by prefixing log messages with "hello world". A simple way to do it would be a decorator function like this:

```ts
const addHelloWorld =
  (log) =>
  (...args) =>
    log("hello world", ...args);

const customLog = addHelloWorld(console.log);

// Prints "hello world 1".
customLog(1);
```

TODO: 1log is the same approach w/ a couple of tweaks.

It may seem strange that the core includes such un-abstract things as labels and the color palette, but there's reasoning behind this. A label is just an abstract label - a combination of a caption and a color - and the core doesn't care how it will be rendered. A color is an abstract color: a name like "amber" plus an object with shades 50-900 from Tailwind CSS palette that can be used to represent this color in any context.

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
