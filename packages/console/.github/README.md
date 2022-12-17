# @1log/console

Logs messages using console.\* methods.

## Installation and usage

Please see [1log readme](https://github.com/ivan7237d/1log).

## API

### consolePlugin

Takes an optional config object and returns a `Plugin`:

```ts
const log = voidLog.add(consolePlugin({ showDelta: false }));
```

Options:

| Option     | Type                                   | Description                               | Default value                                         |
| :--------- | :------------------------------------- | :---------------------------------------- | :---------------------------------------------------- |
| showDelta  | boolean                                | Show time delta from the previous message | `true`                                                |
| showLabels | boolean                                | Show labels                               | `true`                                                |
| format     | `"none" \| "css" \| "ansi"` (`Format`) | Format to use for colors, italics etc.    | `"ansi"` when run in Node/Deno/Bun, `"css"` otherwise |

Time delta is not included in the first message, and also not included if it's less than 1/60th of a second (deltas that small are too much affected by the overhead of logging itself).

### severity

Returns a plugin that sets `[severitySymbol]` prop of log message metadata to the provided severity level: `"debug" | "info" | "warn" | "error"` (`Severity`).

```ts
log.add(severity("error"))(yourError);
```

`consolePlugin` will then use the corresponding method of `console` to log the message. If severity is not set, it will use `console.log`.

---

[Contributing guidelines](https://github.com/ivan7237d/1log/blob/master/.github/CONTRIBUTING.md)
