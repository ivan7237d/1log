# @1log/rxjs

Log everything that happens to an RxJS observable.

## Installation

```bash
npm install @1log/console @1log/core @1log/rxjs
```

or

```bash
yarn add @1log/console @1log/core @1log/rxjs
```

or

```bash
pnpm add @1log/console @1log/core @1log/rxjs
```

## Usage

Create a function `logObservable`, probably in a separate module:

```ts
// log.ts

import { consolePlugin } from "@1log/console";
import { voidLog } from "@1log/core";
import { getLogObservable } from "@1log/rxjs";

export const log = voidLog.add(consolePlugin());
export const logObservable = getLogObservable(log);
```

Then wrap observables with it:

```ts
import { of } from "rxjs";
import { logObservable } from "./log";

const observable = of("a", "b").pipe(logObservable);
observable.subscribe();
// [subscribe 1]
// [1] [next 1] "a"
// [1] [next 2] "b"
// [1] [complete]
// [1] [unsubscribe]
```

You can add a label as follows:

```ts
const observable = of("a").pipe(logObservable("your label"));
observable.subscribe();
// [your label] [subscribe 1]
// [your label] [1] [next 1] "a"
// [your label] [1] [complete]
// [your label] [1] [unsubscribe]

// Equivalent to the previous example.
const observable = logObservable("your label", of("a"));
```

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
