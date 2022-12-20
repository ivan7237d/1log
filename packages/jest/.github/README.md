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
import { resetLog, voidLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";

const log = voidLog.add(jestPlugin());

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
log.add(label("your label"))(1);
expect(readLog()).toMatchInlineSnapshot(`> [your label] 1`);
```

### With time deltas

```ts
import { resetLog, voidLog } from "@1log/core";
import { jestPlugin, readLog, resetTimeDelta } from "@1log/jest";

const log = voidLog.add(jestPlugin());

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
```

## API

### jestPlugin

Takes an optional config object and returns a `Plugin`:

```ts
const log = voidLog.add(jestPlugin({ showDelta: false }));
```

Options:

| Option     | Type    | Description                               | Default value                 |
| :--------- | :------ | :---------------------------------------- | :---------------------------- |
| showDelta  | boolean | Show time delta from the previous message | `true` when using fake timers |
| showLabels | boolean | Show labels                               | `true`                        |

Time delta is not included in the first message, and also not included if it's equal to 0.

### readLog

Returns buffered log entries and clears the buffer. Log entries is of type `Entry[]`, but the main intended use of this array is with `expect(...).toMatchInlineSnapshot()` or `expect(...).toMatchSnapshot()`.

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
