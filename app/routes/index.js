import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import settings from './settings';
import tasks from './tasks';

const controllers = [welcome, users, sessions, settings, tasks];

export default (router, container) =>
  controllers.forEach(fn => fn(router, container));
