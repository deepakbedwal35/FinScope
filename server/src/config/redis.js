const { createClient } = require("redis");

async function handleRedisCaching() {
  const redisHost = process.env.REDIS_HOST || '127.0.0.1';
  const redisPort = process.env.REDIS_PORT || '6379';

  // If REDIS_URL is explicitly provided as a full URL (e.g. on Render),
  // use it directly. Otherwise, build one from host + port (local dev).
  const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

  const client = createClient({ url: redisUrl });

  client.on('error', err => console.log('Redis Setup Error', err));
  client.on('connect', () => console.log('Connected to Redis successfully!'));

  await client.connect();

  return client;
}

module.exports = handleRedisCaching;