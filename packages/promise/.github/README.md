# @1log/promise

Log fulfillment/rejection of a promise.

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

Create a function `logPromise`, probably in a separate module:

```ts
// log.ts

import { consolePlugin } from "@1log/console";
import { voidLog } from "@1log/core";
import { getLogPromise } from "@1log/promise";

export const log = voidLog.add(consolePlugin());
export const logPromise = getLogPromise(log);
```

Then wrap promises with it:

```ts
import { logPromise } from "./log";

const promise1 = logPromise(Promise.resolve(1));
// [resolve] 1

const promise2 = logPromise(Promise.reject(1));
// [reject] 1
```

You can add a label as follows:

```ts
const promise1 = logPromise("your label", Promise.resolve(1));
// [your label] [resolve] 1

// Equivalent to the previous example.
const promise2 = logPromise("your label")(Promise.resolve(1));
```

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
