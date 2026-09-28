const { createClient } = require('redis');

const REDIS_URL =
  process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (error) => {
  console.error('[Redis Error]', error);
});

redisClient.on('connect', () => {
  console.log('[Redis] connecting...');
});

redisClient.on('ready', () => {
  console.log('[Redis] ready');
});

redisClient.on('reconnecting', () => {
  console.log('[Redis] reconnecting...');
});

async function connectRedis() {
  if (redisClient.isOpen) {
    return;
  }

  await redisClient.connect();
}

module.exports = {
  redisClient,
  connectRedis
};
