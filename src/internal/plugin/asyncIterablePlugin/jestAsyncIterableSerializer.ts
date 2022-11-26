type Plugin = Parameters<typeof expect.addSnapshotSerializer>[0];
type GetNewPlugin<Plugin> = Plugin extends { serialize: unknown }
  ? Plugin
  : never;
type NewPlugin = GetNewPlugin<Plugin>;

export const jestAsyncIterableSerializer: NewPlugin = {
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.asyncIterator]?.() === value,
  serialize: () => `[AsyncIterableIterator]`,
};
