import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import settings from './settings';

const controllers = [welcome, users, sessions, settings];

export default (router, container) =>
  controllers.forEach(fn => fn(router, container));
