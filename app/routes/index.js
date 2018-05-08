import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import account from './account';
import tasks from './tasks';
import tags from './tags';

const controllers = [welcome, users, sessions, account, tasks, tags];

export default (router, container) =>
  controllers.forEach(fn => fn(router, container));
