import dotenv from 'dotenv';
import logger from './lib/logger';
import db from './models';
import { reqAuth, reqModify, reqEntityExists } from './lib/middlwares';
import buildFormObj from './lib/formObjectBuilder';
import { encrypt } from './lib/secure';

dotenv.config();

export default {
  ...logger,
  ...db,
  reqAuth,
  reqModify,
  buildFormObj,
  encrypt,
  reqEntityExists,
};
