type Plugin = Parameters<typeof expect.addSnapshotSerializer>[0];
type GetNewPlugin<Plugin> = Plugin extends { serialize: unknown }
  ? Plugin
  : never;
type NewPlugin = GetNewPlugin<Plugin>;

export const jestIterableSerializer: NewPlugin = {
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.iterator]?.() === value,
  serialize: () => `[IterableIterator]`,
};
