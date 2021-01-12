import {
  consoleHandlerPlugin,
  functionPlugin,
  installPlugin,
  promisePlugin,
} from '../..';

installPlugin(consoleHandlerPlugin);
installPlugin(functionPlugin);
installPlugin(promisePlugin);
