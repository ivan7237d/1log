# Contributing Guidelines

## Style guide

- An exported symbol whose name matches the name of the module should be a default export.

- Don't use special naming conventions (e.g. uppercase for constants, \$ for observables, \_ for private members), except capitalization to distinguish a type (class, interface, type alias, enum) from a value of that type, which is the equivalent of using definite and indefinite articles in actual English. React components are an exception to this because of limitations of JSX syntax.

- Write acronyms in camel case: `getUrl`, not `getURL`.
