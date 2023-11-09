# @1log/jest

A 1log plugin that buffers log entries and lets you snapshot them in Jest tests.

## Installation

```bash
npm install @1log/core @1log/jest
```

or

```bash
yarn add @1log/core @1log/jest
```

or

```bash
pnpm add @1log/core @1log/jest
```

## Usage

### Basic

```ts
import { resetLog, noopLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";

const log = noopLog.add(jestPlugin());

afterEach(() => {
  resetLog();
});

test("", () => {
  log(1);
  log(2);
  expect(readLog()).toMatchInlineSnapshot(`
    > 1
    > 2
  `);
});
```

### With labels

```ts
import { label, resetLog, noopLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";

const log = noopLog.add(jestPlugin());

afterEach(() => {
  resetLog();
});

test("", () => {
  log.add(label("your label"))(1);
  expect(readLog()).toMatchInlineSnapshot(`> [your label] 1`);
});
```

### With time deltas

```ts
import { resetLog, noopLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";

const log = noopLog.add(jestPlugin());

afterEach(() => {
  jest.useRealTimers();
  resetLog();
});

test("", () => {
  jest.useFakeTimers();
  log(1);
  jest.advanceTimersByTime(500);
  log(2);
  expect(readLog()).toMatchInlineSnapshot(`
    > 1
    > +500ms 2
  `);
});

Since there is no time delta logged for the first log entry, in cases when you want to track the time it took before that first entry, log another item just to capture the starting time, e.g. `log("start")`.
```

### Alongside consolePlugin

There are two options:

- Have two separate log functions, one that uses `jestPlugin` and one that uses `consolePlugin`.

- Have a `log.ts` module like the example in [1log readme](https://github.com/ivan7237d/1log#usage) and [stub it out](https://jestjs.io/docs/manual-mocks#mocking-user-modules) in tests with a module that uses `jestPlugin` instead of `consolePlugin`.

## Word of caution

It's easy to create large snapshots with this plugin, and it's tempting to do that since you're testing more things that way. It's a deal with the devil though - when you or someone else comes back to this test later, it may end up hard to figure out what the snapshot is actually testing and what makes it correct. It's usually better to keep snapshots small.

## API

### jestPlugin

Takes an optional config object and returns a `Plugin`:

```ts
const log = noopLog.add(jestPlugin({ showDelta: false }));
```

Options:

| Option     | Type    | Description                                      | Default value                 |
| :--------- | :------ | :----------------------------------------------- | :---------------------------- |
| showDelta  | boolean | Show time delta relative to the previous message | `true` when using fake timers |
| showLabels | boolean | Show labels                                      | `true`                        |

Time delta is not included in the first message, and also not included if it's equal to 0.

### readLog

Returns buffered log entries and clears the buffer. Log entries is of type `Entry[]`, but the main intended use of this array is with `expect(...).toMatchInlineSnapshot()` or `expect(...).toMatchSnapshot()`.
