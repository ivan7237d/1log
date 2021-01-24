# 1log

[![npm version](https://img.shields.io/npm/v/1log.svg?style=flat&color=brightgreen)](https://github.com/ivan7237d/1log)
[![gzip size](https://badgen.net/bundlephobia/minzip/1log?color=green)](https://bundlephobia.com/result?p=1log)
[![tree shaking](https://badgen.net/bundlephobia/tree-shaking/1log)](https://bundlephobia.com/result?p=1log)

Log function with superpowers.

## Installing

1. Install the npm package:

   ```
   yarn add 1log
   ```

   or

   ```
   npm install 1log --save
   ```

2. If you want to log messages to the console, add the [default config](#default-config) to your top-level module (skip this step if you're building a library and only need to use logging in tests):

   ```ts
   // ATTENTION: this line should come before imports of modules that call `log`.
   import '1log/defaultConfig';
   ```

3. If you want to use log snapshots in Jest tests, add the [default Jest config](#default-jest-config) to the file referenced by `setupFilesAfterEnv` Jest configuration option (in the case of Create React App this is `src/setupTests.ts`/`.js`):

   ```ts
   import '1log/defaultJestConfig';
   ```

## Usage

The library provides a function `log` that can be used just like the regular `console.log`, but has two superpowers:

- If passed a single argument, `log` returns that argument or a proxy for it (you'll see what we mean by 'proxy' in a moment), meaning that it can be inserted into any expression without changing the behavior of your program, e.g. `f(log(x))`.

- It supports plugins. There are two ways to install a plugin: you can either pass a plugin as an argument to `log`, in which case `log` will return a function just like itself, but with the plugin installed, or you can install a plugin globally by calling `installPlugin(yourPlugin)` (this must be done before calling `log`). Here are a few examples:

  - Log a message using `console.error` instead of the default `console.log`:

    ```ts
    import { log } from '1log';

    log(errorPlugin)('your message');
    ```

  - Prefix all messages logged by a certain module with a badge:

    ```ts
    import { log as logExternal } from '1log';

    const log = logExternal(badgePlugin('your caption'));

    // Rest of the module containing `log` calls.
    ```

  - Log all messages using `console.debug` by default:

    ```ts
    import { debugPlugin, installPlugin } from '1log';

    installPlugin(debugPlugin);
    ```

Both of these superpowers are used by plugins such as [`functionPlugin`](#functionplugin). With this plugin installed, `log(yourFunction)` will return not the function passed as argument, but a proxy for it that acts in the same way as the original function, but additionally logs the arguments and the returned value each time it's called.

## Reading log messages

As an example, let's log two functions one of which is calling the other:

```ts
import { log } from '1log';

const f1 = log((x: number) => x * 10);
const f2 = log((x: number) => f1(x));
f2(42);
```

This will produce the following log:

<img src="https://github.com/ivan7237d/1log/raw/master/images/basic.png" alt="screenshot">

Time deltas that you see in this screenshot are computed using `performance.now` and exclude the time spent on logging itself. If the time delta is less than 10ms, it is muted, if greater than 1s, bold. For time deltas less than 1ms, we display up to 3 significant digits after the decimal point (on Node, you can see deltas like 0.00572ms), and for time deltas of 1ms and more we display time delta with millisecond precision, e.g. `1h 2m 3.450s`.

Indentation indicates (synchronous) stack level.

If you mark each function with its own badge,

```ts
import { badgePlugin, log } from '1log';

const f1 = log(badgePlugin('f1'))((x: number) => x * 10);
//            ^^^^^^^^^^^^^^^^^^^
const f2 = log(badgePlugin('f2'))((x: number) => f1(x));
//            ^^^^^^^^^^^^^^^^^^^
f2(42);
```

[create 2] will become [create 1], because counters are specific to the combination of preceding badges:

<img src="https://github.com/ivan7237d/1log/raw/master/images/basic-with-badges.png" alt="screenshot">

> :bulb: TIP
>
> You can configure Chrome's Developer Tools to display file names and line numbers that point to your own source files instead of a library file by adding a pattern `/internal/` in Settings -> Blackboxing, but currently this does not work in cases when non-blackboxed code can only be reached via the async stack, e.g. when logging Promise outcomes.

## Using log snapshots in tests

Inspecting log messages can be useful in tests, especially in combination with Jest's snapshots feature. When running tests, instead of logging messages to the console, they are placed in a buffer, and by calling `getMessages()`, you can retrieve them and clear the buffer. Let's take a look at a sample test:

```ts
import { getMessages, log } from '1log';

/**
 * The function that we'll be testing. Returns a promise resolving to 42 after a
 * user-provided timeout.
 */
const timer = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(42), duration);
  });

test('timer', async () => {
  const promise = log(timer(500));
  jest.runAllTimers();
  await promise;
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms Promise {}
    [create 1] [resolve] +500ms 42
  `);
});
```

Logging saved us the need to advance the time by 499ms, check that the promise is not resolved, then advance the time some more and check that the promise has resolved to the right value.

## Default config

Importing `'1log/defaultConfig'` is the same as importing a file with the following contents (the plugins used here are documented below):

```ts
import {
  consoleHandlerPlugin,
  functionPlugin,
  installPlugins,
  iterableIteratorPlugin,
  promisePlugin,
} from '1log';

installPlugins(
  consoleHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterableIteratorPlugin,
);
```

## Default Jest config

Importing `'1log/defaultJestConfig'` is the same as importing a file with the following contents:

```ts
import {
  functionPlugin,
  getMessages,
  installPlugins,
  iterableIteratorPlugin,
  jestMessagesSerializer,
  mockHandlerPlugin,
  promisePlugin,
  resetBadgeNumbers,
  resetTimeDelta,
} from '1log';

// Add a Jest snapshot serializer that formats log messages.
expect.addSnapshotSerializer(jestMessagesSerializer);
// Add a Jest snapshot serializer for values proxied by
// iterableIteratorPlugin.
expect.addSnapshotSerializer({
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.iterator]?.() === value,
  serialize: () => `[IterableIterator]`,
});

installPlugins(
  mockHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterableIteratorPlugin,
);

beforeEach(() => {
  // Use fake timers to make time deltas predicable.
  jest.useFakeTimers('modern');
  // Reset 1log's internal timer.
  resetTimeDelta();
  // Reset numbers in badges like [create <number>].
  resetBadgeNumbers();
  // Clear any prior log messages.
  getMessages();
});

afterEach(() => {
  // Restore real timers.
  jest.useRealTimers();
});
```

## Building for production

You can disable logging in production by not installing some of the plugins. For example, if you use Webpack, instead of importing `'1log/defaultConfig'`, you can import a file with the following contents:

```ts
if (process.env.NODE_ENV !== 'production') {
  require('1log/defaultConfig');
}

export {};
```

With this configuration,

- The bulk of the 1log library will be tree-shaken in production.

- Values that are proxied in development (e.g. when you have `functionPlugin` installed and write `log(yourFunction)`) will be passed through the `log` function unchanged in production, removing the performance cost of proxying.

## Usage in libraries

Besides using the `log` function in unit tests, sometimes a library needs to log information for the benefit of the library user. In this case we recommend adding a module like this:

```ts
import { badgePlugin, log } from '1log';

export const prefixedLog = log(badgePlugin('<library name>'));
```

and using `prefixedLog` in any code that's included in the build. This way,

- By default, the library will not log any messages.

- The user can enable logging by configuring 1log.

- Messages logged by the library will be prefixed with `[<library name>]` badge. The user will be able to mute them by passing a filter to `consoleHandlerPlugin`/`mockHandlerPlugin`.

## Plugins included in this package

### [`consoleHandlerPlugin`](https://github.com/ivan7237d/1log/blob/master/src/internal/plugin/consoleHandlerPlugin/consoleHandlerPlugin.ts)

Returns a plugin that writes messages using `console.log` (default), `console.debug`, `console.info`, `console.warn` or `console.error`.

Can optionally be passed a predicate to mute messages for which the predicate returns false. E.g. to mute messages prefixed by `[<caption>]` badge unless the severity is `error`, replace `consoleHandlerPlugin()` from the default config with

```ts
consoleHandlerPlugin(
  ({ badges, severity }) =>
    badges[0]?.caption !== '<caption>' || severity === Severity.error,
);
```

The plugin supports styled messages in modern browsers and Node. For Node, the output looks as follows:

<img src="https://github.com/ivan7237d/1log/raw/master/images/node.png" alt="screenshot">

### [`mockHandlerPlugin`](https://github.com/ivan7237d/1log/blob/master/src/internal/plugin/mockHandlerPlugin.ts)

Returns a plugin that buffers log messages in memory. Like `consoleHandlerPlugin`, takes an optional parameter that can be used to mute some of the messages. Use function `getMessages()` to retrieve the messages and clear the buffer.

### `functionPlugin`

If the piped value is a function, logs its creation and invocations. You can see sample output in the section _[Reading log messages](#reading-log-messages)_.

### `promisePlugin`

If the piped value is a promise, logs its creation and outcome.

Example (promise fullfilled):

```ts
import { log } from '1log';

log((async () => 42)());
```

<img src="https://github.com/ivan7237d/1log/raw/master/images/promise-resolve.png" alt="screenshot">

Example (promise rejected):

```ts
import { log } from '1log';

log(
  (async () => {
    throw 42;
  })(),
).catch(() => {});
```

<img src="https://github.com/ivan7237d/1log/raw/master/images/promise-reject.png" alt="screenshot">

### `iterableIteratorPlugin`

For a value that satisfies

```ts
value !== undefined && value !== null && value[Symbol.iterator]?.() === value;
```

(e.g. one returned by a generator function or methods `entries`, `keys`, `values` of `Map` and `Set`), logs creation, nexts, yields, and done's.

Example:

```ts
import { log } from '1log';

[...log(new Set([1, 2]).values())];
```

<img src="https://github.com/ivan7237d/1log/raw/master/images/iterable-iterator.png" alt="screenshot">

### `badgePlugin`

Prefixes messages with a blue-colored badge, taking badge caption as the single parameter. You can see sample output in the section _[Reading log messages](#reading-log-messages)_.

### `severityPlugin`

Sets severity level to a number provided as the single parameter. If multiple plugins set severity level, the highest severity wins.

### Shortcuts to set severity

Although the library supports any number as severity level, plugins `consoleHandlerPlugin` and `mockHandlerPlugin` attach special meaning to severities from the following enum:

```ts
enum Severity {
  debug = 10,
  info = 20,
  warn = 30,
  error = 40,
}
```

For convenience, the library exports `debugPlugin`, `infoPlugin`, `warnPlugin`, and `errorPlugin` which are shortcuts for `severityPlugin(Severity.debug)`, `severityPlugin(Severity.info)` etc.

Example:

```ts
import {
  badgePlugin,
  debugPlugin,
  errorPlugin,
  infoPlugin,
  log as logExternal,
  warnPlugin,
} from '1log';

const log = logExternal(badgePlugin('yourBadge'));
log(42);
log(debugPlugin)(42);
log(infoPlugin)(42);
log(warnPlugin)(42);
log(errorPlugin)(42);
```

<img src="https://github.com/ivan7237d/1log/raw/master/images/severity.png" alt="screenshot">

## Plugins from other packages

- [1log-rxjs](https://github.com/ivan7237d/1log-rxjs): a plugin for logging [RxJS](https://rxjs-dev.firebaseapp.com/guide/overview) observables.

- [1log-antiutils](https://github.com/ivan7237d/1log-antiutils): a plugin for [Antiutils](https://github.com/ivan7237d/antiutils) library.

## Writing plugins

Plugin type signature is documented in file [plugin.ts](https://github.com/ivan7237d/1log/blob/master/src/internal/logger/plugin.ts). If you are writing a proxy plugin, you can use package [1log-rxjs](https://github.com/ivan7237d/1log-rxjs) or [1log-antiutils](https://github.com/ivan7237d/1log-antiutils) as a starting point. There are a few things to keep in mind as regards proxy plugins:

- `transform` function is run in an [`excludeFromTimeDelta`](https://github.com/ivan7237d/1log/blob/master/src/internal/logger/timeDelta.ts) callback to exclude that function's execution time from time deltas included in log messages. If your proxy creates a function and makes it available externally, you should yourself wrap that function in `excludeFromTimeDelta`, and if you call a user-provided function, you should do the opposite and wrap it in `includeInTimeDelta`.

- To keep track of stack level, user-provided functions should also be wrapped in [`increaseStackLevel`](https://github.com/ivan7237d/1log/blob/master/src/internal/logger/stackLevel.ts).

- If you use instances of class `C` as proxies, make sure that `scope` catches instances of `C` but not instances of a superclass of `C` by checking that `value.constructor === C`. This has to be done even when proxies are functions (`C` is `Function`) or plain objects (`C` is `Object`).

- If you're proxying a user function, make sure to copy over any properties, because a function can couple as an object: `Object.assign(yourProxyFunction, originalFunction)`.

---

[Contributing guidelines](https://github.com/ivan7237d/antiutils/blob/master/.github/CONTRIBUTING.md)
