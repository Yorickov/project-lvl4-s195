import dotenv from 'dotenv';
import log from './lib/logger';
import db from './models';

dotenv.config();

export default { log, ...db };
