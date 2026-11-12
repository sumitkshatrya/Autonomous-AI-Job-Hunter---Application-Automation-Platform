import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rawMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autoapply-ai';
const sanitizedMongoUri = rawMongoUri.replace(/\/([^/?]+)(\?|$)/, (_match, dbName, suffix) => {
  const cleanDb = dbName.trim().replace(/\s+|%20/g, '_').toLowerCase();
  return `/${cleanDb}${suffix}`;
});

export const config = {
  mongoUri: sanitizedMongoUri,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  pollIntervalMs: parseInt(process.env.WORKER_POLL_INTERVAL_MS || '2000', 10),
};
