# @1log/function

Logs calls, returns and throws of a regular or async function

## Installation

```bash
npm install @1log/console @1log/core @1log/function
```

or

```bash
yarn add @1log/console @1log/core @1log/function
```

or

```bash
pnpm add @1log/console @1log/core @1log/function
```

## Usage

Create a function `logFunction`, probably in a separate module:

```ts
// log.ts

import { consolePlugin } from "@1log/console";
import { voidLog } from "@1log/core";
import { getLogFunction } from "@1log/function";

export const log = voidLog.add(consolePlugin());
export const logFunction = getLogFunction(log);
```

Then wrap functions with it:

```ts
import { logFunction } from "./log";

const f = logFunction((x: number) => x + 1);
f(1);
// [call 1] 1
// [1] [return] 2
f(10);
// [call 2] 10
// [2] [return] 11

const g = logFunction(async () => Promise.resolve(1));
await g();
// [call 1]
// [1] [return promise]
// [1] [resolve] 1
```

You can add a label as follows:

```ts
const f = logFunction("f", (x: number) => x + 1);
// [f] [call 1] 1
// [f] [1] [return] 2

// Equivalent to the previous example.
const f = logFunction("f")((x: number) => x + 1);
```

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
