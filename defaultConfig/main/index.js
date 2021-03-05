'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const lib = require('../..');

lib.installPlugins(
  lib.consoleHandlerPlugin(),
  lib.functionPlugin,
  lib.promisePlugin,
  lib.iterablePlugin,
  lib.asyncIterablePlugin,
);
