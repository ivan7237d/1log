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

```ts
import { consolePlugin } from "@1log/console";
import { voidLog } from "@1log/core";
import { getLogFunction } from "@1log/function";

const log = voidLog.add(consolePlugin());
const logFunction = getLogFunction(log);

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

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
