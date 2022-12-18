# @1log/promise

Logs fulfillment/rejection of a promise.

## Installation

```bash
npm install @1log/console @1log/core @1log/promise
```

or

```bash
yarn add @1log/console @1log/core @1log/promise
```

or

```bash
pnpm add @1log/console @1log/core @1log/promise
```

## Usage

```ts
import { consolePlugin } from "@1log/console";
import { voidLog } from "@1log/core";
import { getLogPromise } from "@1log/promise";

const log = voidLog.add(consolePlugin());
const logPromise = getLogPromise(log);

// Logs `[resolve] 1`.
logPromise(Promise.resolve(1));

// Logs `[reject] 1`.
logPromise(Promise.reject(1));

// Logs `[your label] [resolve] 1`.
logPromise("your label", Promise.resolve(1));

// Equivalent to the previous call.
logPromise("your label")(Promise.resolve(1));
```

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
