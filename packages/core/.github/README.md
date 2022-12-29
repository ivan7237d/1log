# @1log/core

## Installation and usage

Please see [1log readme](https://github.com/ivan7237d/1log).

## API

### voidLog

A log function that does nothing. The type of this and any derived log function is `Log`, and the package also exports types `Data`, `Meta`, and `Plugin`.

### label

A plugin that adds an object of shape `{caption: string; color?: ColorName}` (`Label`) to the top of `meta[labelsSymbol]` array. The argument can be either a caption or an object containing caption and color name:

```ts
label("your caption");
label({ caption: "your caption", color: "yellow" });
```

### palette

A subset of Tailwind palette, an object whose keys are color names (`ColorName`) and values are objects with hex representations of shades from 50 to 900.

### resetLog

A function that you can call to indicate to all stateful plugins that they should reset their state. Resets the Symbol returned by its sister function `getInstanceSymbol`.
