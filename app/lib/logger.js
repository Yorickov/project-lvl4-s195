import debug from 'debug';

const flow = debug('sequelize:flow');
const sess = debug('sequelize:session');
const user = debug('sequelize:users');
const sett = debug('sequelize:settings');

export default {
  flow,
  sess,
  user,
  sett,
};
