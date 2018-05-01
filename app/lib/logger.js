import debug from 'debug';

const test = debug('sequelize:test');
const flow = debug('sequelize:flow');
const sess = debug('sequelize:session');
const user = debug('sequelize:users');
const sett = debug('sequelize:settings');
const midd = debug('sequelize:middlware');

export default {
  test,
  flow,
  sess,
  user,
  sett,
  midd,
};
