# 1log

An unopinionated JS/TS logging framework.

- Provides a `console.log` equivalent that can be used in the middle of expressions, like `f(log(arg))`.

- Has a minimal core and leaves as much as possible of the implementation details to plugins.

## Installation

```bash
npm install @1log/console @1log/core
```

or

```bash
yarn add @1log/console @1log/core
```

or

```bash
pnpm add @1log/console @1log/core
```

## Usage

Create a `log` function, probably in a separate module:

```ts
// log.ts

import { consolePlugin } from "@1log/console";
import { noopLog } from "@1log/core";

export const log = noopLog.add(consolePlugin());
```

This function can be used just like `console.log`, but has two additional features. First, it returns the last argument passed to it instead of `void`, so as mentioned above, can be inserted in an expression. Second, calling `log.add(...plugins)` returns a new log function with more plugins added to it. For example, to prefix all log messages from some module with a label, you would do

```ts
import { label } from "@1log/core";
import { log as baseLog } from "./log";

const log = baseLog.add(label("your module"));

log("will have prefix");
```

Another example: use `console.error` instead of `console.log`:

```ts
import { severity } from "@1log/console";
import { log } from "./log";

log.add(severity("error"))("oops");
```

## Plugins

A plugin is a function that takes and returns a "data" object of shape `{args, meta}` where `args` is the arguments passed to the log function, and `meta` is an object of type `Meta` that has metadata on the log message. The data object is passed through all the plugins in the following order:

```ts
log.add(called3rd).add(called2nd, called1rst);
```

For example, `severity` plugin from the code sample above adds a property `[severitySymbol]: "error"` to `meta`, which `consolePlugin` then sees and uses `console.error` to log the message. If we wanted to only log errors, we could create a plugin inline in `log.ts` as follows:

```ts
// log.ts

import { consolePlugin, severitySymbol } from "@1log/console";
import { noopLog } from "@1log/core";

export const log = noopLog.add((data) =>
  data.meta[severitySymbol] === "error" ? consolePlugin()(data) : data
);
```

If you're adding your own props to `meta`, it's recommended to use a `Symbol` as key and augment the `Meta` interface like this:

```ts
export const yourSymbol = Symbol("yourSymbol");

declare module "@1log/core" {
  interface Meta {
    [yourSymbol]?: YourPropertyValueType;
  }
}
```

## Packages

- [core](https://github.com/ivan7237d/1log/tree/master/packages/core): `noopLog`, the notion of labels, color palette, and a mechanism to reset stateful plugins.
- [console](https://github.com/ivan7237d/1log/tree/master/packages/console): a plugin that logs messages using console.\* methods (supports colored labels, time deltas and severity levels).
- [jest](https://github.com/ivan7237d/1log/tree/master/packages/jest): a plugin that buffers log messages and lets you snapshot them in Jest tests (supports labels and time deltas).
- [promise](https://github.com/ivan7237d/1log/tree/master/packages/promise): log fulfillment/rejection of a promise.
- [function](https://github.com/ivan7237d/1log/tree/master/packages/function): log arguments, returned value and errors for a regular or async function.
- [rxjs](https://github.com/ivan7237d/1log/tree/master/packages/rxjs): log everything that happens to an RxJS observable.

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
