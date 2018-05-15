import debug from 'debug';

const logDb = debug('sequelize:db');
const logReq = debug('sequelize:http');

export default { logDb, logReq };
