import dotenv from 'dotenv';
import logger from './lib/logger';
import db from './models';

dotenv.config();

export default { logger, ...db };
